module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			basic: {
			  src: [
					// 'js/lib/jquery.min.js',
					'js/tracking.js',
			  		'js/resize.js', 
			  		'js/local_storage.js',
					'js/main_view.js', 
			  		'js/custom_view.js',
			  		'js/options.js',
			  		'js/layout.js',
			  		'js/utility.js',
			  		'js/display.js',
			  		'js/main.js'
			  	],
			  dest: 'public/<%= pkg.name %>.js'
			},
			extras: {
				src: [
					'js/background.js'
				],
				dest: 'public/<%= pkg.name %>_background.js'
			}
		},
		jshint: {
		    beforeconcat: [
					// 'js/lib/jquery.min.js',
					'js/tracking.js',
			  		'js/resize.js', 
			  		'js/main_view.js', 
			  		'js/custom_view.js',
			  		'js/options.js',
			  		'js/layout.js',
			  		'js/utility.js',
			  		'js/display.js',
			  		'js/main.js',
			  		'js/background.js'
			  	],
		  	afterconcat: [
		  			'public/<%= pkg.name %>.js',
		  			'public/<%= pkg.name %>_background.js'
		  		]
		},
		uglify: {
			my_target: {
				files: {
					'public/<%= pkg.name %>.min.js': ['public/<%= pkg.name %>.js'],
					'public/<%= pkg.name %>_background.min.js': ['public/<%= pkg.name %>_background.js']
				}
		    }
		},
		less: {
		  production: {
		    options: {
		      cleancss: true
		    },
		    files: {
		      "public/style.css": "css/index.less"
		    }
		  }
		}
	});

	['grunt-contrib-concat', 'grunt-contrib-jshint', 'grunt-contrib-uglify', 'grunt-contrib-less'].forEach(grunt.loadNpmTasks);

	grunt.registerTask('default', ['concat', 'jshint', 'uglify', 'less']);
};