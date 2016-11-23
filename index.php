<?php
    if(isset($_GET['type'])){
        $api_key = "fae5c467341743e4a0ecd75696fd8b3a";
        $type = $_GET['type'];
        if($type == 'legislator'){
            if(array_key_exists('get', $_GET) && $_GET['get'] == 'all'){
                echo file_get_contents("http://104.198.0.197:8080/legislators?per_page=all&apikey=$api_key");
            }
            else if(array_key_exists('get', $_GET) && $_GET['get'] == 'both'){
                $committee = $bills = null;
                $bioguide_id = $_GET['bioguide_id'];

                $json = file_get_contents("http://104.198.0.197:8080/committees?per_page=5&member_ids=$bioguide_id&apikey=$api_key");
                $decoded = json_decode($json);
                $committee = $decoded->results;

                $json = file_get_contents("http://104.198.0.197:8080/bills?per_page=5&sponsor_id=$bioguide_id&apikey=$api_key");
                $decoded = json_decode($json);
                $bills = $decoded->results;

                $results = new stdClass();
                $results->committee = $committee;
                $results->bills = $bills;

                echo json_encode($results);
            }
        }
        else if($type == 'bills'){
            if(array_key_exists('get', $_GET) && $_GET['get'] == 'all'){
                $json = file_get_contents("http://104.198.0.197:8080/bills?per_page=50&history.active=true&last_version.urls.pdf__exists=true&apikey=$api_key");
                $decoded = json_decode($json);
                $results = $decoded->results;

                $json = file_get_contents("http://104.198.0.197:8080/bills?per_page=50&history.active=false&last_version.urls.pdf__exists=true&apikey=$api_key");
                $decoded = json_decode($json);
                $new = $decoded->results;

                foreach ($new as $value) {
                    array_push($results, $value);
                }
                echo json_encode($results);
            }
        }
        else if($type == 'committee'){
            if(array_key_exists('get', $_GET) && $_GET['get'] == 'all'){
                echo file_get_contents("http://104.198.0.197:8080/committees?per_page=all&apikey=$api_key");
            }
        }
    }
    else{
        echo "Error";
    }
?>
