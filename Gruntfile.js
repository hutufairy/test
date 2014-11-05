module.exports = function(grunt){
// 构建任务配置
    grunt.initConfig({
        //读取package.json的内容，形成个json数据
        pkg: grunt.file.readJSON('package.json'),

        //Grunt 任务配置
        imagemin: {
            dynamic:{
                files:[{
                        expand: true,
                        cwd:    'imgs/',
                        src:    ['**/*.{png,jpg,gif}'],
                        dest:   'imgs/build/'
                }]
            }
        },
        concat: {
            options: {
                // 定义一个用于插入合并输出文件之间的字符
                separator: ';\n'
            },
            chat: {
                src: ['public/src/lib/jquery/**/*.js', 'public/src/lib/bootstrap/**/*.js', 'public/src/lib/socket.io/**/*.js', 'public/src/js/index.js'],
                dest: 'public/build/js/<%= pkg.name %>.js'
            }
        },
        uglify: {
            build:{
                src: 'public/build/js/<%= pkg.name %>.js',
                dest: 'public/build/js/<%= pkg.name %>.min.js'
            }
        }
    });

    //加载Grunt插件
    //grunt.loadNpmTasks('Grunt插件名’);
    // grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //默认的Grunt任务
    //grunt.registerTask('default',['Grunt任务'])；
    // grunt.registerTask('default', ['imagemin']);
    grunt.registerTask('default', ['concat', 'uglify']);
};