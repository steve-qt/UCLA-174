window.Team_Project = window.classes.Team_Project =
    class Team_Project extends Scene_Component {
        constructor(context, control_box)
        {
            // The scene begins by requesting the camera, shapes, and materials it will need.
            super(context, control_box);
            // First, include a secondary Scene that provides movement controls:
            if (!context.globals.has_controls)
                context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 0, 30), Vec.of(0, 0, 0), Vec.of(0, 1, 0));
            this.initial_camera_location = Mat4.inverse(context.globals.graphics_state.camera_transform);

            //
            const r = context.width / context.height;
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            const shapes = {
                sphere: new Subdivision_Sphere(4),
                ball  : new Subdivision_Sphere(3)
            };
            this.submit_shapes(context, shapes);

            // Make some Material objects available to you:
            this.materials =
                {
                    ball1: context.get_instance( Phong_Shader ).material( Color.of( 0,0.8,0.8,1 ) ),
                    ball2: context.get_instance( Phong_Shader ).material( Color.of( 0.1,0.4,0.8,1 ) ),
                    dartboard: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient:1, texture:
                            context.get_instance("assets/dartboard.png",false)}),
                    arrow: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient:1, texture:
                            context.get_instance("assets/dog.png",false)}),
                    target: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient:1, texture:
                            context.get_instance("assets/sniper.png",false)})
                };

            this.camera_z = 30;
            this.lights = [ new Light( Vec.of( -5,5,5,1 ), Color.of( 0,0.1,0.1,1 ), 1000000 ) ];
            this.range_x = 20;
            this.range_y = 10;
            this.range_z = -150;

            this.board_is_random_move = false;
            this.board_x = 0;
            this.board_y = 0;
            this.board_z = -80;
            this.board_size = 9;
            this.board_size_z = 0.1;
            this.directedX = 1;
            this.directedY = 1;

            this.shooter_x = 0;
            this.shooter_y = 0;
            this.shooter_z = 0;

            this.colors = [Color.of(0.1,0.1,0.1,1),Color.of(0.8,0.3,0.1,1),Color.of(0.3,0.4,0.4,1),
                           Color.of(0.1,0.1,0.1,1),Color.of(0.1,0.1,0.1,1),Color.of(0.1,0.1,0.1,1),
                           Color.of(0.1,0.1,0.1,1),Color.of(0.4,0.1,0.1,1),Color.of(0.1,0.1,0.1,1),
                           Color.of(0.1,0.1,0.1,1)];

            this.ball_num = 100;
            this.is_shot = new Array(this.ball_num);
            this.start_time = new Array(this.ball_num);
            this.ball_x = new Array(this.ball_num);
            this.ball_y = new Array(this.ball_num);
            this.ball_z = new Array(this.ball_num);
            this.ball_size = 2;
            this.ball_direction = new Array(this.ball_num);
            let i = 0;
            for(; i < this.ball_num; i++){
                this.is_shot[i] = false;
                this.start_time[i] = 0;
                this.ball_z[i] = 0;
                this.ball_y[i] = 0;
                this.ball_x[i] = 0;
                this.ball_direction[i] = -1;
            }
        }

        shoot(){
            let i = 0;
            for(;i < this.ball_num;i++){
                //not shot yet
                if(!this.is_shot[i]){
                    this.is_shot[i] = true;
                    this.start_time[i]=0;
                    this.ball_x[i] = this.shooter_x;
                    this.ball_y[i] = this.shooter_y;
                    this.ball_z[i] = this.shooter_z;
                    this.ball_direction[i] = -1;
                    break;
                }
            }
        }

        check_collision(i){
            let ball_x = this.ball_x[i];
            let ball_y = this.ball_y[i];
            let ball_size = this.ball_size;
            let board_low_x = this.board_x - this.board_size;
            let board_high_x = this.board_x + this.board_size;
            let board_low_y = this.board_y - this.board_size;
            let board_high_y = this.board_y + this.board_size;
            if (ball_x >= board_low_x && ball_x <= board_high_x
                && ball_y >= board_low_y && ball_y <= board_high_y){
                this.board_size /= 1.05;
                return true;
            }
            return false;
        }

        shooter_move_left(){
            this.shooter_x--;
            if (this.shooter_x < -this.range_x) {
                this.shooter_x = -this.range_x  ;
            }
        }

        shooter_move_right(){
            this.shooter_x++;
            if (this.shooter_x > this.range_x){
                this.shooter_x = this.range_x;
            }
        }

        shooter_move_up(){
            this.shooter_y++;
            if (this.shooter_y > this.range_y) {
                this.shooter_y = this.range_y;
            }
        }

        shooter_move_down(){
            this.shooter_y--;
            if (this.shooter_y < -this.range_y) {
                this.shooter_y = -this.range_y;
            }
        }

        board_random_move(){
            let is_move_up_down = Math.random() > 0.2 ? true : false;
            let num = Math.random();
            if (is_move_up_down){
                this.board_y = this.board_y  + this.directedY * num;
            }else{
                this.board_x = this.board_x  + this.directedX * num;
            }

            if (this.board_x > this.range_x){
                this.board_x = this.range_x;
                this.directedX = -this.directedX;
            }

            else if (this.board_x < -this.board_x){
                this.board_x = - this.board_x;
                this.directedX = -this.directedX;
            }


            if (this.board_y > this.range_y){
                this.board_y = this.range_y;
                this.directedY= -this.directedY;
            }

            else if (this.board_y < -this.range_y){
                this.board_y = - this.range_y;
                this.directedY= -this.directedY;
            }

        }

        random_move(){
            this.board_is_random_move = !(this.board_is_random_move);
        }

        make_control_panel() {
            this.key_triggered_button("Shoot",["c"],this.shoot);
            this.key_triggered_button("Move Board",["r"],this.random_move);
            this.key_triggered_button("Move Left",["b"],this.shooter_move_left);
            this.key_triggered_button("Move Right",["m"],this.shooter_move_right);
            this.key_triggered_button("Move Up",["h"],this.shooter_move_up);
            this.key_triggered_button("Move Down",["n"],this.shooter_move_down);
        }

        display(graphics_state) {
            graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
            const t = graphics_state.animation_time / 100000, dt = graphics_state.animation_delta_time / 100000;

            //render dartboard
            if(this.board_is_random_move){
                this.board_random_move();

            }

            //render board
            let dartboard_matrix = Mat4.identity().times(Mat4.translation([this.board_x,this.board_y,this.board_z]));
            dartboard_matrix = dartboard_matrix.times(Mat4.scale([this.board_size,this.board_size,this.board_size_z]));
            this.shapes.ball.draw(graphics_state,dartboard_matrix,this.materials.dartboard);

            //render shooter
            let shooter_matrix = Mat4.identity().times(Mat4.scale([1,1,0.1])).times(Mat4.translation([this.shooter_x,this.shooter_y,this.shooter_z]));
            this.shapes.sphere.draw(graphics_state,shooter_matrix,this.materials.target);

            //render bullet
            //render balls
            let i = 0;
            let is_collided = false;
            for(;i < this.ball_num;i++){
                if(this.is_shot[i]){
                    if (this.ball_z[i] >=  this.board_z - this.board_size_z
                        && this.ball_z[i] <=  this.board_z + this.board_size_z ){
                        if (this.check_collision(i)){
                            this.ball_direction[i] = 1;
                            //this.ball_z[i] = this.board_z;
                        }
                    }
                    this.start_time[i]++;
                    this.ball_z[i] += 2 * this.ball_direction[i];
                    let ball_matrix = Mat4.identity().times(Mat4.translation([this.ball_x[i],this.ball_y[i],this.ball_z[i]]));
                    ball_matrix = ball_matrix.times(Mat4.scale([this.ball_size,this.ball_size,this.ball_size]));
                    this.shapes.ball.draw(graphics_state,ball_matrix,this.materials.ball1.override({color : Color.of(Math.random(),Math.random(),Math.random(),1)}));

                    if (this.ball_z[i] < this.range_z || this.ball_z[i] >  this.camera_z){
                      // this.is_shot[i] = false;
                    }
                }
            }
        }
    };

