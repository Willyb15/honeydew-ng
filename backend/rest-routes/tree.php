<?php

$app->group('/tree', function () use ($app) {

    $app->get('/sets', function () use ($app) {
        /* pass through if there are query params on the request */
        $req = $app->request;
        $needle = $req->get('needle');
        if ($needle) {
            $app->pass();
        }

        try {
            exec('grep -hr -P "^Set:" /opt/honeydew/features', $sets);

            /* reduce the list of SetNames to a unique set */
            $sets = array_unique(array_reduce($sets, function ($acc, $it) {
                $it = explode(' ', trim(preg_replace('/\s+@?|@/', ' ', substr($it, 4))));
                foreach ($it as $set) {
                    $acc[] = $set;
                }
                return $acc;
            }, array()));


            sort($sets);
            echo successMessage(array(
                "tree" => array_map(function ($it) {
                    $leaf['label'] = $it . '.set';
                    $leaf['children'] = array();
                    $leaf['folder'] = '/sets';
                    return $leaf;
                }, $sets)
            ));
        }
        catch (Exception $e) {
            $app->halt(418, errorMessage($e->getMessage()));
        }

        /* /sets would match the /:folder+ route below, so we need to
        purposefully bail out of the route matching. */
        $app->stop();
    });


    $app->get('/:folder+', function ($folder) use ($app) {
        try {
            $req = $app->request();

            $basedir = "/opt/honeydew/";
            $folder = implode("/", $folder);

            $needle = $req->get('needle');
            if ($needle) {
                $files = grepDirectory($folder, $needle);
                echo successMessage(array(
                    "list" => $files
                ));
            }
            else {
                $tree = listFeaturesDir($basedir . $folder, $basedir);
                echo successMessage(array("tree" => $tree));
            }
        }
        catch (Exception $e) {
            $app->halt(418, errorMessage($e->getMessage()));
        };
    });

    function listFeaturesDir( $start_dir='.', $basedir ) {
        $files = array();
        $basedir_length = strlen($basedir);

        if ($fh = opendir( $start_dir )) {
            while(($file = readdir( $fh )) !== false){
                /* loop through the files, skipping . and .. */
                if (strcmp($file, '.')==0 || strcmp($file, '..')==0) {
                    continue;
                }

                $filepath = $start_dir . '/' . $file;

                $candidate = array(
                    'label' => $file,
                );

                if (is_dir( $filepath )) {
                    $children = listFeaturesDir($filepath, $basedir);

                    /* exclude empty folders */
                    if (!empty($children)) {
                        $candidate['children'] = $children;
                        $files[] = $candidate;
                    }
                }
                else {
                    if (endswith($file, "feature")
                        || endswith($file, "phrase")
                        || endswith($file, "set")) {
                        $candidate['children'] = array();

                        /* pop off basedir from the folder */
                        $candidate['folder'] = substr($start_dir, $basedir_length - 1);
                        $files[] = $candidate;
                    }
                }
            }
            closedir($fh);
        }
        else {
            $files = false;
        }


        usort($files, function ($a, $b) {
            return strcmp($a['label'], $b['label']);
        });

        return $files;
    }
});

?>
