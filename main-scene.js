window.Team_Project = window.classes.Team_Project =
    class Team_Project extends Scene_Component {
        constructor(context, control_box) {
            // The scene begins by requesting the camera, shapes, and materials it will need.
            super(context, control_box);
            // First, include a secondary Scene that provides movement controls:
            if (!context.globals.has_controls)
                context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 0, 40), Vec.of(0, 0, 0), Vec.of(0, 1, 0));
            this.initial_camera_location = Mat4.inverse(context.globals.graphics_state.camera_transform);

            //
            const r = context.width / context.height;
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            const shapes = {
                box:   new Cube(),
                sphere: new Subdivision_Sphere(4),
                ball: new Subdivision_Sphere(3),
                square : new Square()
            };
            this.submit_shapes(context, shapes);

            // Make some Material objects available to you:
            this.materials =
                {
                    ball1: context.get_instance(Phong_Shader).material(Color.of(0, 0.8, 0.8, 1)),
                    ball2: context.get_instance(Phong_Shader).material(Color.of(0.1, 0.4, 0.8, 1)),
                    dartboard: context.get_instance(Texture_Scroll_X).material(Color.of(0, 0, 0, 1), {
                        ambient: 1, texture:
                            context.get_instance("assets/earth.jpg", false)
                    }),
                    dartboard1: context.get_instance(Texture_Scroll_X).material(Color.of(0, 0, 0, 1), {
                        ambient: 1, texture:
                            context.get_instance("assets/sun.jpg", false)
                    }),
                    dartboard2: context.get_instance(Texture_Scroll_X).material(Color.of(0, 0, 0, 1), {
                        ambient: 1, texture:
                            context.get_instance("assets/moon.jpg", false)
                    }),
                    arrow: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {
                        ambient: 1, texture:
                            context.get_instance("assets/complete.png", false)
                    }),
                    target: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {
                        ambient: 1, texture:
                            context.get_instance("assets/sniper.png", false)
                    }),
                    fragment: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {
                        ambient: 1, texture:
                            context.get_instance("assets/sniper.jpg", false)
                    }),
                    panel: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {
                        ambient: 1, texture:
                            context.get_instance("assets/panel.png", false)
                    }),
                    corona: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {
                        ambient: 1, texture:
                            context.get_instance("assets/corona.png", false)
                    }),
                    star: context.get_instance(Texture_Scroll_X).material(Color.of(0, 0, 0, 1), {
                        ambient: 1,
                        texture: context.get_instance("assets/blood.png", true)
                    }),
                };
            //sound
            this.shooting_sound= new Howl({
                src: 'sound/shooting_sound.mp3',
                volume: 0.5,
                html5: true, // A live stream can only be played through HTML5 Audio.
                format: ['mp3', 'aac']
            });
            this.explosion_sound= new Howl({
                src: 'sound/explosion.mp3',
                volume: 0.5,
                html5: true, // A live stream can only be played through HTML5 Audio.
                format: ['mp3', 'aac']
            });
            this.winning_sound= new Howl({
                src: 'sound/winner.wav',
                html5: true, // A live stream can only be played through HTML5 Audio.
                format: ['wav']
            });
            this.start_sound= new Howl({
                src: 'sound/start.wav',
                html5: true, // A live stream can only be played through HTML5 Audio.
                format: ['wav']
            });
            this.winning_sound_on = false;


            this.camera_z = 30;
            this.lights = [new Light(Vec.of(-5, 5, 5, 1), Color.of(0, 0.1, 0.1, 1), 1000000)];
            this.range_x = 20;
            this.range_y = 15;
            this.range_z = -150;

            this.started = false;
            this.board_x = 0;
            this.board_y = 0;
            this.board_z = -100;
            this.board_delta_x = Math.random() * 7;
            this.board_delta_y = Math.random() * 4;
            this.board_size = 20;
            this.board_size_limit = 5;
            this.board_size_z = 0.1;
            this.directedX = 1;
            this.directedY = 1;

            this.shooter_x = 0;
            this.shooter_y = 0;
            this.shooter_z = 10;

            this.colors = [Color.of(0.1, 0.1, 0.1, 1), Color.of(0.8, 0.3, 0.1, 1), Color.of(0.3, 0.4, 0.4, 1),
                Color.of(0.1, 0.1, 0.1, 1), Color.of(0.1, 0.1, 0.1, 1), Color.of(0.1, 0.1, 0.1, 1),
                Color.of(0.1, 0.1, 0.1, 1), Color.of(0.4, 0.1, 0.1, 1), Color.of(0.1, 0.1, 0.1, 1),
                Color.of(0.1, 0.1, 0.1, 1)];

            this.ball_num = 100;
            this.is_shot = new Array(this.ball_num);
            this.start_time = new Array(this.ball_num);
            this.ball_x = new Array(this.ball_num);
            this.ball_y = new Array(this.ball_num);
            this.ball_z = new Array(this.ball_num);
            this.ball_size = 2;
            this.ball_direction = new Array(this.ball_num);
            let i = 0;
            for (; i < this.ball_num; i++) {
                this.is_shot[i] = false;
                this.start_time[i] = 0;
                this.ball_z[i] = 0;
                this.ball_y[i] = 0;
                this.ball_x[i] = 0;
                this.ball_direction[i] = -1;
            }

            //explosion
            this.fragment_num = 1000;
            this.fragment_num_start_time = new Array(this.fragment_num);
            this.fragment_is_shot = new Array(this.fragment_num);
            this.fragment_x = new Array(this.fragment_num);
            this.fragment_y = new Array(this.fragment_num);
            this.fragment_z = new Array(this.fragment_num);
            this.fragment_size = 2;
            i = 0;
            for (; i < this.fragment_num; i++) {
                this.fragment_is_shot[i] = false;
                this.fragment_num_start_time[i] = 0;
                this.fragment_x[i] = 0;
                this.fragment_y[i] = 0;
                this.fragment_z[i] = 0;
            }


            this.target = this.materials.dartboard;
            this.star_transform = Mat4.identity().times(Mat4.translation([0,0,-200]))
                .times(Mat4.scale([100, 100, -50]));
        }

        shoot() {
            let i = 0;
            for (; i < this.ball_num; i++) {
                //not shot yet
                if (!this.is_shot[i]) {
                    this.shooting_sound.play();
                    this.is_shot[i] = true;
                    this.start_time[i] = 0;
                    this.ball_x[i] = this.shooter_x;
                    this.ball_y[i] = this.shooter_y;
                    this.ball_z[i] = this.shooter_z;
                    this.ball_direction[i] = -1;
                    break;
                }
            }

        }

        check_collision(i) {
            let ball_x = this.ball_x[i];
            let ball_y = this.ball_y[i];
            let ball_z = this.ball_z[i];
            let ball_size = this.ball_size;
            let board_low_x = this.board_x - this.board_size;
            let board_high_x = this.board_x + this.board_size;
            let board_low_y = this.board_y - this.board_size;
            let board_high_y = this.board_y + this.board_size;
            let board_low_z = this.board_z- this.board_size;
            let board_high_z = this.board_z + this.board_size;
            if (ball_x >= board_low_x && ball_x <= board_high_x
                && ball_y >= board_low_y && ball_y <= board_high_y
                && ball_z >= board_low_z && ball_z <= board_high_z) {
                this.board_size /= 1.1;
                return true;
            }
            return false;
        }

        shooter_move_left() {
            this.shooter_x--;
            if (this.shooter_x < -this.range_x) {
                this.shooter_x = -this.range_x;
            }
        }

        shooter_move_right() {
            this.shooter_x++;
            if (this.shooter_x > this.range_x) {
                this.shooter_x = this.range_x;
            }
        }

        shooter_move_up() {
            this.shooter_y++;
            if (this.shooter_y > this.range_y) {
                this.shooter_y = this.range_y;
            }
        }

        shooter_move_down() {
            this.shooter_y--;
            if (this.shooter_y < -this.range_y) {
                this.shooter_y = -this.range_y;
            }
        }

        board_random_move() {
            this.board_x = this.board_x + this.directedX * this.board_delta_x;
            this.board_y = this.board_y + this.directedY * this.board_delta_y;

            if (this.board_x > this.range_x) {
                this.board_x = this.range_x;
                this.directedX = -this.directedX;
                this.board_delta_x = Math.random() * 7;
            } else if (this.board_x < -this.board_x) {
                this.board_x = -this.board_x;
                this.directedX = -this.directedX;
                this.board_delta_x = Math.random() * 7;
            }
            if (this.board_y > this.range_y) {
                this.board_y = this.range_y;
                this.directedY = -this.directedY;
                this.board_delta_y = Math.random() * 4;
            } else if (this.board_y < -this.range_y) {
                this.board_y = -this.range_y;
                this.directedY = -this.directedY;
                this.board_delta_y = Math.random() * 4;
            }
        }
        attack_earth() {
            this.target = this.materials.dartboard
        }

        attack_sun() {
            this.target = this.materials.dartboard1
        }

        attack_moon(){
            this.target = this.materials.dartboard2
        }

        random_move() {
            this.started = true;
            this.start_sound.play();
            this.start_sound.play();
        }

        make_control_panel() {
            this.key_triggered_button("Shoot", ["c"], this.shoot);
            this.key_triggered_button("Start", ["u"], this.random_move);
            this.key_triggered_button("Move Left", ["b"], this.shooter_move_left);
            this.key_triggered_button("Move Right", ["m"], this.shooter_move_right);
            this.key_triggered_button("Move Up", ["h"], this.shooter_move_up);
            this.key_triggered_button("Move Down", ["n"], this.shooter_move_down);
            this.key_triggered_button("Attack_Sun", ["t"], this.attack_sun);
            this.key_triggered_button("Attack_Moon", ["l"], this.attack_moon);
            this.key_triggered_button("Attack_Earth", ["p"], this.attack_earth());
        }

        display(graphics_state) {
            graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
            const t = graphics_state.animation_time / 100000, dt = graphics_state.animation_delta_time / 100000;
            this.shapes.box.draw(graphics_state, this.star_transform, this.materials.star);

            //render dartboard
            if (this.started) {


                this.board_random_move();
            }else{
                //render corona panel
                let panel_matrix = Mat4.identity();
                panel_matrix = panel_matrix.times(Mat4.scale([15,15,15]));
                this.shapes.square.draw(graphics_state,panel_matrix,this.materials.corona);
            }

            if (this.board_size  >= this.board_size_limit){
                let dartboard_matrix = Mat4.identity().times(Mat4.translation([this.board_x, this.board_y, this.board_z]))
                    .times(Mat4.scale([this.board_size, this.board_size, this.board_size_z]))
                    .times( Mat4.rotation(.60 * Math.PI * dt, Vec.of(0,0,1)))
                this.shapes.ball.draw(graphics_state, dartboard_matrix, this.target);
            }else{
                //won!!!! render fragments and display texts
                if(!this.winning_sound_on){
                    this.winning_sound_on = true;
                    this.winning_sound.play();
                }
                let j= 0;
                this.fragment_is_shot[0] = true;
                for (; j < this.fragment_num; j++) {
                    if (this.fragment_is_shot[j]) {
                        this.fragment_num_start_time[j] += 0.1;
                        let alpha_time = this.fragment_num_start_time[j];
                        this.fragment_x[j] = 2 * alpha_time * Math.cos(alpha_time);
                        this.fragment_y[j] = 2 * alpha_time * Math.sin(alpha_time);
                        this.fragment_z[j] = this.board_z + 4 * alpha_time;
                        let fragment_matrix = Mat4.identity().times(Mat4.translation([this.fragment_x[j], this.fragment_y[j], this.fragment_z[j]]));
                        fragment_matrix = fragment_matrix.times(Mat4.scale([this.fragment_size, this.fragment_size, this.fragment_size]));
                        this.shapes.ball.draw(graphics_state, fragment_matrix, this.materials.fragment);
                    }
                    if (this.fragment_num_start_time[j] > 0.8 && j < this.fragment_num - 1)
                        this.fragment_is_shot[j + 1] = true;
                }

                //render panel
                let panel_matrix = Mat4.identity();
                panel_matrix = panel_matrix.times(Mat4.scale([15,15,15]));
                this.shapes.square.draw(graphics_state,panel_matrix,this.materials.panel);

            }


            if(!this.winning_sound_on && this.started){
                //render shooter
                let shooter_matrix = Mat4.identity().times(Mat4.scale([1, 1, 0.1])).times(Mat4.translation([this.shooter_x, this.shooter_y, this.shooter_z]));
                this.shapes.sphere.draw(graphics_state, shooter_matrix, this.materials.target);
            }

            //render bullet
            let i = 0;
            for (; i < this.ball_num; i++) {
                if (this.is_shot[i]) {
                    if (this.check_collision(i)) {
                        this.ball_direction[i] = 1;
                        this.explosion_sound.play();
                    }
                    this.start_time[i]++;
                    this.ball_z[i] += 2 * this.ball_direction[i];
                    let ball_matrix = Mat4.identity().times(Mat4.translation([this.ball_x[i], this.ball_y[i], this.ball_z[i]]));
                    ball_matrix = ball_matrix.times(Mat4.scale([this.ball_size, this.ball_size, this.ball_size]));
                    this.shapes.ball.draw(graphics_state, ball_matrix, this.materials.ball1.override({color: Color.of(Math.random(), Math.random(), Math.random(), 1)}));
                    if (this.ball_z[i] < this.range_z || this.ball_z[i] > this.camera_z) {
                        this.is_shot[i] = false;
                    }
                }
            }
        }
    }
class Texture_Scroll_X extends Phong_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER *********
{
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #6.
    return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          vec4 tex_color = texture2D( texture, f_tex_coord + vec2(mod(animation_time,10.0)*0.1,0.0));                          // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
}
}

class Texture_Rotate extends Phong_Shader {
    fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    {
        // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #7.
        return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          float theta = animation_time * 3.1415926 * 0.5;
          mat2 rotation = mat2( cos( theta ), -sin( theta ), sin( theta ), cos( theta ) );
          vec4 tex_color = texture2D( texture, rotation * (f_tex_coord - vec2( 0.5, 0.5 ) ) + vec2( 0.5, 0.5) );
          
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}

