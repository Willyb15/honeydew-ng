Feature: editor

$url = 'http://www.google.com'
$editor = '/#/features/e2e/delete-me2.feature'
$noPermissions = '/#/features/e2e/no-permissions.feature'
$new = '/#/features/Anew.feature'
$fileMenu = 'partial_link_text=File'

$hostname = 'class=hostname'
$executeButton = 'id=execute'
$reportsPanel = 'class=center-panel element'
$modal = 'class=hdew-modal'
$alert = 'css=.alert div element'

 Scenario: set up

 Scenario: auto-save changes
 Given I am on the $editor page
   When I input random text into the editor cm
     Then the page should contain $input
   When I pause for 2 seconds
   When I refresh the page
   When I pause for 1 second
   Then the page should contain $input

 Scenario: preserve choices
 Given I am on the $editor page
   When I select IE 10 Local from the css=[ng-options] dropdown
   When I input $url into the input field $hostname
 Given I am on the $noPermissions page
     Then the $hostname:contains('$url') element should be present
     Then IE 10 Local should be selected in the css=[ng-options] dropdown

 Scenario: execute a job
 Given I am on the $editor page
   When I reset the input field $hostname
   When I input $url into the input field $hostname
   When I click on the link $executeButton
     Then the $reportsPanel element should be visible

 # ln -s . /opt/honeydew/features/
 Scenario: no permissions
 Given I am on the $noPermissions page
   When I input random text into the editor cm
     Then I wait for the text permission denied to be present

 # chmod 0777 .
 Scenario: new file
 Given I am on the $editor page
   When I click on the link $fileMenu
   When I click on the link partial_link_text=New
   When I reset the input field id=input-file
   When I input features/Anew.feature into the input field id=input-file
   When I input random text into the input field id=input-jira
   When I store the inner text of the css=.tree-label span element as $firstLeaf
   When I click on the link class=btn-submit
     Then the url should match \/Anew.feature
     Then the page should contain $input
     Then the css=.tree-label span element should contain the text Anew.feature

 Scenario: delete file
 Given I am on the $new page
   When I click on the link $fileMenu
   When I click on the link partial_link_text=Delete
     Then the url should match FAQ.feature
     Then the page should not contain $input
     Then the inner text of the css=.tree-label span element should be the same as $firstLeaf

 # undo delete
 Given I am on the $editor page
   When I click on the link $fileMenu
   When I click on the link partial_link_text=Undo
     Then the url should match new.feature
     Then the css=.tree-label span element should contain the text Anew.feature

 # cleanup
   When I click on the link $fileMenu
   When I click on the link partial_link_text=Delete

 Scenario: permalink
 Given I am on the $editor page
   When I click on the link $fileMenu
   When I click on the link partial_link_text=Copy URL
   When I wait for the $modal element to be visible
     Then the id=input-permalink element should be visible