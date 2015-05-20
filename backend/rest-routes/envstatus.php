<?php
$app->group('/envstatus', function () use ($app) {
    require_once 'rest-routes/envstatus/lockerboxclient.php'; # provides get_build

    $app->get('/app/:appName/env/:env', function ( $appName, $env ) use ( $app ) {
        $check_url = $app->request()->get('check');
        $build = get_build( $env, $appName );

        echo json_encode(array(
            'healthcheck' => healthcheck( $appName, $check_url ),
            'build' => array ( 'webpub' => $build ),
            'honeydew' => honeydew_status( $build, url_to_domain( $check_url ) )
        ));
    });

    function healthcheck ( $app, $url ) {
        $results = array();
        $boxes = array( 'webpub' );

        if ( $app === 'SC' ) {
            array_push($boxes, 'author', 'data');
        }

        foreach ( $boxes as $name ) {
            if ( $name !== 'webpub' ) {
                $check_url = preg_replace( '/www/', $name, $url );
            }
            else {
                $check_url = $url;
            }

            $results[$name] = array(
                'status' => check_health( $check_url )
            );
        }

        $results['summary'] = array_reduce(
            array_keys( $results ), function ( $acc, $key ) use ( $results ) {
                return $acc && $results[$key]['status'];
            }, true);

        return $results;
    }

    function check_health ( $url ) {
        /* some healthchecks are misbehaving when we check via http,
        so we're experimeting with https for all of them. */
        $url = preg_replace('/http:/', 'https:', $url);
        if ( can_connect( $url ) ) {
            $opts = array(
                'http' => array(
                    'header' => "X-Forwarded-For: 50.232.112.210"
                )
            );

            $context = stream_context_create($opts);
            $health = @file_get_contents( $url, false, $context );
            return strpos( $health, 'successful' ) !== false;
        }
        else {
            return false;
        }
    }

    function can_connect ( $url ) {
        if ( strpos($url, 'https') === false ) {
            $port = 80;
        }
        else {
            $port = 443;
        }

        $timeout = 3;
        $domain = url_to_domain( $url );
        $connection = @fsockopen($domain, $port, $errno, $errstr, $timeout);

        return is_resource($connection);
    }

    function url_to_domain ( $url ) {
        $strip_origin = preg_replace( '/origin\.doctoroz/', 'doctoroz', $url );
        return preg_replace('/https?:\/\/(.*)\/.*/', "$1", $strip_origin);
    }

    function honeydew_status ( $build, $url) {
        $host = '%' . $url . '%';
        $sql = '
        SELECT COUNT( IF ( status != "failure", 1, NULL ) ) AS success,
        count(*) AS total
        FROM report
        WHERE buildNumber = ?
        AND setRunId IS NOT NULL
        AND HOST like ?
        AND endDate >= now() - INTERVAL 2 DAY';

        $pdo = hdewdb_connect();
        $query = $pdo->prepare($sql);
        $query->execute( array( $build, $host ) );
        $status = $query->fetchAll(PDO::FETCH_ASSOC);


        $ret = $status[0];
        if ( isset($_REQUEST['DEBUG']) && $_REQUEST['DEBUG'] ) {
            $with_build = preg_replace('/buildNumber = \?/', "buildNumber = \"$build\"", $sql);
            $with_host = preg_replace('/HOST like \?/', "HOST like \"$host\"", $with_build);
            $readable_sql = preg_replace('/\s+/', ' ', $with_host);

            $ret['query'] = $readable_sql;
        }

        /* returns { success: $count, total: $count[, query: $query] } */
        return $ret;
    }
});
