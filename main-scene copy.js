window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
    class Assignment_Three_Scene extends Scene_Component {
        constructor(context, control_box)
        {
            // The scene begins by requesting the camera, shapes, and materials it will need.
            super(context, control_box);
            // First, include a secondary Scene that provides movement controls:
            if (!context.globals.has_controls)
                context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 10, 20), Vec.of(0, 0, 0), Vec.of(0, 1, 0));
            this.initial_camera_location = Mat4.inverse(context.globals.graphics_state.camera_transform);

            const r = context.width / context.height;
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            const shapes = {
                torus: new Torus(15, 15),
                torus2: new (Torus.prototype.make_flat_shaded_version())(15, 15),

                // TODO:  Fill in as many additional shape instances as needed in this key/value table.
                //        (Requirement 1)
                sphere: new Subdivision_Sphere(4),
                planet1: new (Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
                planet2: new (Subdivision_Sphere.prototype.make_flat_shaded_version())(3),
                planet3: new Subdivision_Sphere(4),
                planet4: new Subdivision_Sphere(4),
                moon: new Subdivision_Sphere(1)
            };
            this.submit_shapes(context, shapes);

            // Make some Material objects available to you:
            this.materials =
                {
                    test: context.get_instance(Phong_Shader).material(Color.of(1, 1, 0, 1), {ambient: .2}),
                    ring: context.get_instance(Ring_Shader).material(),

                    // TODO:  Fill in as many additional material objects as needed in this key/value table.
                    //        (Requirement 1)
                    sun: context.get_instance(Phong_Shader).material(Color.of(1,0,0,1), {ambient: 1}),
                    planet1: context.get_instance(Phong_Shader).material(Color.of(40/200,60/200,80/200,1), {ambient : 0},{diffusivity: 0.8}),
                    planet2: context.get_instance(Phong_Shader).material(Color.of(50/200,104/200,40/200,1),{ambient : 0}, {diffusivity:0.2}, {specularity: 1}),
                    planet3: context.get_instance(Phong_Shader).material(Color.of(140/200,104/200,40/200,1),{ambient : 0}, {diffusivity:1}, {specularity: 1}),
                    planet4: context.get_instance(Phong_Shader).material(Color.of(158/255,1,1,1),{ambient : 0.3}, {specularity : 1}),
                    moon: context.get_instance(Phong_Shader).material(Color.of(10/200,112/200,12/200),{ambient : 0})
                };

            this.lights = [new Light(Vec.of(5, -10, 5, 1), Color.of(0, 1, 1, 1), 1000)];
        }

        make_control_panel() {
            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
            this.key_triggered_button("View solar system", ["0"], () => this.attached = () => this.initial_camera_location);
            this.new_line();
            this.key_triggered_button("Attach to planet 1", ["1"], () => this.attached = () => this.planet_1);
            this.key_triggered_button("Attach to planet 2", ["2"], () => this.attached = () => this.planet_2);
            this.new_line();
            this.key_triggered_button("Attach to planet 3", ["3"], () => this.attached = () => this.planet_3);
            this.key_triggered_button("Attach to planet 4", ["4"], () => this.attached = () => this.planet_4);
            this.new_line();
            this.key_triggered_button("Attach to planet 5", ["5"], () => this.attached = () => this.planet_5);
            this.key_triggered_button("Attach to moon", ["m"], () => this.attached = () => this.moon);
        }

        display(graphics_state) {
            graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
            const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

            // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 2 and 3)
            //this.shapes.torus2.draw(graphics_state, Mat4.identity(), this.materials.test);
            let r = 2 + Math.sin(0.4*Math.PI*t);
            let color = 0.5*Math.sin(0.4*Math.PI*t);
            let sun_matrix = Mat4.identity();

            //draw sun
            sun_matrix = sun_matrix.times(Mat4.scale([r,r,r]));
            this.shapes.sphere.draw(graphics_state,sun_matrix,this.materials.sun.override({color: Color.of(0.5 + color,0,0.5 - color,1)}));

            //setting lighting
            this.lights = [new Light(Vec.of(0,0,0,1),Color.of(0.5 + color,0,0.5 - color,1),100**r)];

            //draw planet 1
            let planet1_matrix =  Mat4.identity();
            planet1_matrix = planet1_matrix.times(Mat4.translation([5 * Math.sin(0.5*t),0,5 * Math.cos(0.5 * t)]));
            this.shapes.planet1.draw(graphics_state,planet1_matrix,this.materials.planet1);

            //draw planet 2
            let planet2_matrix =  Mat4.identity();
            planet2_matrix = planet2_matrix.times(Mat4.translation([8 * Math.sin(0.4*t),0,8 * Math.cos(0.4 * t)]));
            this.shapes.planet2.draw(graphics_state,planet2_matrix,
                Math.floor(t  % 2) == 0 ? this.materials.planet2 : this.materials.planet2.override({gourad: 1}));

            //draw planet 3 + ring
            let planet3_matrix = Mat4.identity();
            planet3_matrix = planet3_matrix.times(Mat4.translation([11 * Math.sin(0.3*t),0,11 * Math.cos(0.3 * t)]));
            //rotation itself
            planet3_matrix = planet3_matrix.times(Mat4.rotation(t,Vec.of(1,1,1)));
            //
            let ring_matrix = planet3_matrix;
            ring_matrix = ring_matrix.times(Mat4.scale([0.9,0.8,0.2]));
            this.shapes.planet3.draw(graphics_state,planet3_matrix,this.materials.planet3);
            this.shapes.torus.draw(graphics_state,ring_matrix,this.materials.planet3);

            //draw planet 4 and moon
            let planet4_matrix = Mat4.identity();
            planet4_matrix = planet4_matrix.times(Mat4.translation([14 * Math.sin(0.25*t),0,14 * Math.cos(0.25 * t)]));
            this.shapes.planet4.draw(graphics_state,planet4_matrix,this.materials.planet4);

            let moon_matrix = planet4_matrix;
            moon_matrix = moon_matrix.times(Mat4.translation([2 * Math.sin(t),0, 2 * Math.cos(t)]));
            this.shapes.moon.draw(graphics_state,moon_matrix,this.materials.moon);

            this.planet_1 = planet1_matrix;
            this.planet_2 = planet2_matrix;
            this.planet_3 = planet3_matrix;
            this.planet_4 = planet4_matrix;
            this.moon = moon_matrix;
            if(this.attached != undefined){
                let desire_matrix = Mat4.inverse(this.attached().times(Mat4.translation([0,0,5])));
                //graphics_state.camera_transform = desire_matrix;
                graphics_state.camera_transform = desire_matrix.map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1 ) );
            }
        }
    };


// Extra credit begins here (See TODO comments below):

window.Ring_Shader = window.classes.Ring_Shader =
    class Ring_Shader extends Shader {
        // Subclasses of Shader each store and manage a complete GPU program.
        material() {
            // Materials here are minimal, without any settings.
            return {shader: this}
        }

        map_attribute_name_to_buffer_name(name) {
            // The shader will pull single entries out of the vertex arrays, by their data fields'
            // names.  Map those names onto the arrays we'll pull them from.  This determines
            // which kinds of Shapes this Shader is compatible with.  Thanks to this function,
            // Vertex buffers in the GPU can get their pointers matched up with pointers to
            // attribute names in the GPU.  Shapes and Shaders can still be compatible even
            // if some vertex data feilds are unused.
            return {object_space_pos: "positions"}[name];      // Use a simple lookup table.
        }

        // Define how to synchronize our JavaScript's variables to the GPU's:
        update_GPU(g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl) {
            const proj_camera = g_state.projection_transform.times(g_state.camera_transform);
            // Send our matrices to the shader programs:
            gl.uniformMatrix4fv(gpu.model_transform_loc, false, Mat.flatten_2D_to_1D(model_transform.transposed()));
            gl.uniformMatrix4fv(gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(proj_camera.transposed()));
        }

        shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        {
            return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
        }

        vertex_glsl_code()           // ********* VERTEX SHADER *********
        {
            return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;

        void main()
        { 
        }`;           // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        }

        fragment_glsl_code()           // ********* FRAGMENT SHADER *********
        {
            return `
        void main()
        { 
        }`;           // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        }
    };

window.Grid_Sphere = window.classes.Grid_Sphere =
    class Grid_Sphere extends Shape           // With lattitude / longitude divisions; this means singularities are at
    {
        constructor(rows, columns, texture_range)             // the mesh's top and bottom.  Subdivision_Sphere is a better alternative.
        {
            super("positions", "normals", "texture_coords");
            // TODO:  Complete the specification of a sphere with lattitude and longitude lines
            //        (Extra Credit Part III)
        }
    };