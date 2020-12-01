jQuery(function ($) {
  // List of Github/Travis projects to query
  var projects = [
    'xdv/divvyd',
    'xdv/divvy-lib',
    {
      name: 'xdv/divvy-lib-java',
      branch: 'master'
    },
    'xdv/divvy-client',
    {
      name: 'xdv/divvy-blobvault',
      branch: 'master'
    },
    'xdv/divvy-rest',
    'xdv/gatewayd'
  ];

  // Some customization for Moment.js
  moment.lang('en', {
    relativeTime : {
      future: "in %s",
      past:   "%s ago",
      s:      "seconds",
      m:      "one minute",
      mm:     "%d minutes",
      h:      "one hour",
      hh:     "%d hours",
      d:      "one day",
      dd:     "%d days",
      M:      "one month",
      MM:     "%d months",
      y:      "one year",
      yy:     "%d years"
    }
});

  var $projectList = $('#project_list').find('tbody');
  $.each(projects, function (i, project) {
    if ("string" === typeof project) {
      project = {
        name: project
      };
    }

    if ("string" !== typeof project.branch) project.branch = 'develop';

    var $project = $('<tr></tr>').appendTo($projectList);

    /*
    // Column 1: Build status badge
    var $statusColumn = $('<td><a><img/></a></td>')
      .addClass('status')
      .find('a')
        .attr('href', 'https://travis-ci.org/'+project.name)
      .end()
      .find('img')
        .attr('src', 'https://travis-ci.org/'+project.name+'.png?branch='+project.branch)
      .end()
      .appendTo($project);
    */

    // Column 1: Build status
    var $buildNoColumn = $('<td></td>')
          .addClass('status')
          .text('Loading...')
          .appendTo($project);

    // Column 2: Project name and link
    var $nameColumn = $('<td><a></a></td>')
      .addClass('name')
      .find('a')
        .attr('href', 'https://travis-ci.org/'+project.name)
        .text(project.name)
      .end()
      .appendTo($project);

    // Column 3: Last commit message
    var $commitColumn = $('<td></td>')
          .addClass('commit')
          .text('Loading...')
          .appendTo($project);

    // Column 4: Last build duration
    var $buildDurationColumn = $('<td></td>')
          .addClass('duration')
          .text('Loading...')
          .appendTo($project);

    // Column 5: Last build time
    var $buildTimeColumn = $('<td></td>')
          .addClass('time')
          .text('Loading...')
          .appendTo($project);

    // Load information from Travis CI
    $.get('https://api.travis-ci.org/repos/'+project.name+'/branches/'+project.branch,
          function (data) {
            console.log(data);
            $buildNoColumn.empty();
            var $buildNumber = $('<a></a>')
                  .text(data.branch.number)
                  .attr('href', 'https://travis-ci.org/'+project.name+'/builds/'+data.branch.id)
                  .addClass('alert-link')
                  .appendTo($buildNoColumn);

            $commitColumn.empty();
            var $commitMessage = $('<div><a></a></div>')
                  .find('a')
                    .attr('href', 'https://github.com/'+project.name+'/commit/'+data.commit.sha)
                    .text(data.commit.message.split("\n").shift())
                  .end()
                  .appendTo($commitColumn);
            var $commitAuthor = $('<div class="commit_author"></div>')
                  .text(data.commit.committer_name + ' committed '+moment(data.commit.committed_at).fromNow())
                  .appendTo($commitColumn);

            var buildDuration = moment.duration(data.branch.duration * 1000).humanize();
            $buildDurationColumn.text(buildDuration);

            $buildTimeColumn.text(moment(data.branch.finished_at).fromNow());

            // Color-coding for build number column
            if (data.branch.state === 'passed') {
              $buildNoColumn.prepend('<span class="glyphicon glyphicon-ok"></span> ');
              $buildNoColumn.addClass('success');
            } else if (data.branch.state === 'failed') {
              $buildNoColumn.prepend('<span class="glyphicon glyphicon-exclamation-sign"></span> ');
              $buildNoColumn.addClass('danger');
            } else if (data.branch.state === 'pending' || data.branch.state === 'started' || data.branch.state === 'created') {
              $buildNoColumn.prepend('<span class="glyphicon glyphicon-time"></span> ');
              $buildNoColumn.addClass('warning');
            } else {
              console.log("Unknown state '"+data.branch.state+"'");
            }
          }, 'json');
  });
});
