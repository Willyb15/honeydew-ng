module.exports = function(grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    nodeunit: {
      all: ['test/*_test.js']
    },

    sass: {
      options: {
        style: 'expanded'
      },
      dist: {
        files: {
          'docs/css/select2-bootstrap.css': 'lib/build.scss',
          '_jekyll/css/select2-bootstrap.css': 'lib/build.scss',
          'select2-bootstrap.css': 'lib/build.scss'
        }
      },
      test: {
        files: {
          'tmp/select2-bootstrap.css': 'lib/build.scss'
        }
      }
    },

    jshint: {
      all: ['Gruntfile.js', '*.json']
    },

    bump: {
      options: {
        files: ['package.json', 'bower.json', 'lib/select2-bootstrap/version.rb'],
        push: false,
        createTag: false
      }
    },

    copy: {
      main: {
        files: [
          { src: ['bower_components/bootstrap/dist/css/bootstrap.min.css'], dest: '_jekyll/css/bootstrap.min.css', expand: false },
          { src: ['bower_components/bootstrap/dist/js/bootstrap.min.js'], dest: '_jekyll/js/bootstrap.min.js', expand: false },
          { src: ['bower_components/respond/dest/respond.min.js'], dest: '_jekyll/js/respond.min.js', expand: false },
          { cwd: 'bower_components/bootstrap/dist/fonts', src: ['**/*'], dest: '_jekyll/fonts', expand: true }
        ]
      }
    },

    shell: {
      jekyllBuild: {
        command: 'jekyll build -s _jekyll -d docs'
      },
      jekyllServe: {
        command: 'jekyll serve -w -s _jekyll -d docs'
      }
    },

    'gh-pages': {
      options: {
        base: 'docs',
        message: 'Update gh-pages.'
      },
      src: ['**/*']
    },

    watch: {
      files: 'lib/select2-bootstrap.scss',
      tasks: ['sass'],
      options: {
        livereload: true
      }
    }

  });

};
