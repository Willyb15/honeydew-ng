<?php

$app->group('/jobs', function () use ($app) {

    $app->post('/', function () use ($app) {
        $jobData = (array) json_decode($app->request()->getBody());

        try {
            validateJobData($jobData);
            // although jobs.php is in /rest-routes, it's required by
            // rest.php, which a sibling of HoneydewJob.

            $jobData['filename'] = $jobData['file'];

            foreach ($jobData['browser'] as $browser) {
                $data = $jobData;
                $data['browser'] = $browser;
                $job = new HoneydewJob($data);
                $jobs[] = $job;
                $cmds[] = $job->syncShellCommand();
            }

            if (array_key_exists('serial', $jobData) && $jobData['serial']) {
                $cmd = runInSerial($cmds);
            }
            else {
                foreach ($jobs as $job) {
                    $cmd[] = $job->addToQueue();
                }
            }

            echo successMessage(array(
                'command' => $cmd,
                'jobs' => $jobs
            ));
        }
        catch (Exception $e) {
            $app->halt('418', errorMessage($e->getMessage()));
        }
    });

    $app->post('/sets/rerunfailed/:setId', function ($setId) use ($app) {
        try {
            validateSetId($setId);

            $cmds = getFailuresForSet($setId);
            $cmd = runInSerial($cmds);

            echo successMessage(array(
                "command" => $cmd
            ));
        }
        catch (Exception $e) {
            $app->halt('418', errorMessage($e->getMessage()));
        }
    });

    $app->delete('/sets/:setId', function ($setId) use ($app) {
        try {
            validateSetId($setId);

            $pdo = hdewdb_connect();
            $sth = $pdo->prepare('UPDATE setRun set deleted = 1 where id = ?');
            $sth->execute(array($setId));
            echo successMessage("set run deleted!");
        }
        catch (Exception $e) {
            $app->halt('418', errorMessage($e->getMessage()));
        }
    });

    function validateJobData( $jobData ) {
        $required = array('file', 'host', 'browser');

        array_walk($required, function ($it) use ($jobData) {
            if ($jobData[$it] == '') {
                throw new Exception('Your ' . $it . ' is invalid: [' . $jobData[$it] . ']');
            }
        });
    }

    function validateSetId( $setId ) {
        $set = intval($setId);
        if (!is_int($set) || $set == 0) {
            throw new Exception('The setId must be an integer: ' . $setId);
        }
    }

    function getFailuresForSet($setId) {
        $pdo = hdewdb_connect();
        $sth = $pdo->prepare('
            SELECT r.id, r.browser, r.host, r.featureFile, u.name
            FROM report r
            JOIN user u
            ON r.userId = u.id
            WHERE r.setRunId = ?
            AND r.status != "success"
            AND r.status != "bugged"
        ');
        $sth->execute(array($setId));
        $res = $sth->fetchAll(PDO::FETCH_FUNC, function ($id, $browser, $host, $file, $name) {
            $job = new HoneydewJob(array(
                'reportId' => $id,
                'browser' => $browser,
                'host' => $host,
                'filename' => $file,
                'username' => $name
            ));

            return $job->syncShellCommand();
        });

        return $res;
    }

    function runInSerial( $cmds ) {
        $cmd = implode(' && ', $cmds) . ' > /dev/null 2>&1 &';
        $testUser = 'php_backend_tester';
        if (!preg_match('/\^user=' . $testUser. '/', $cmd)) {
            system($cmd);
        }

        return $cmd;
    }
});


?>
