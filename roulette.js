const RED = "#ED553B";
const GREEN = "#3CAEA3";
const BLUE = "#20639B";
const YELLOW = "#F6D55C";

const SQUARE = 0;
const RECTANGLE = 1;
const CIRCLE = 2;
const TRIANGLE = 3;
const OVAL = 4;
const RHOMBUS = 5;

let slices_amount = 4;
let roulette_size;
let max_shape_width;

let initial_angle;
let angle = 0;
let delta_angle;
let final_angle = 0;
let ready_to_spin = true;

let button;
let should_spin = false;
let should_remove_slice = false;
let first_spin = true;
let paused = false;

class Slice {
	constructor(slice_color, shape_color, shape) {
		this.slice_color = slice_color;
		this.shape_color = shape_color;
		this.shape = shape;
		this.angle = 2 * PI / slices_amount;
	}

	update_angle() {
		this.angle = 2 * PI / slices_amount;
	}

	draw() {
		rotate(this.angle);
		fill(this.slice_color);
		arc(0, 0, roulette_size, roulette_size, 0, this.angle);
		textSize(roulette_size / 10);
		switch (this.shape) {
			case SQUARE:
				draw_square(max_shape_width, this.angle, this.shape_color);
				break;
			case RECTANGLE:
				draw_rectangle(max_shape_width, this.angle, this.shape_color);
				break;
			case CIRCLE:
				draw_circle(max_shape_width, this.angle, this.shape_color);
				break;
			case TRIANGLE:
				draw_triangle(max_shape_width, this.angle, this.shape_color);
				break;
			case OVAL:
				break;
			case RHOMBUS:
				break;
		}
	}
}

class Color {
	constructor(r, g, b) {
		this.red = r;
		this.green = g;
		this.blue = b;

	}
}

class Circle {
	constructor(position, size) {
		this.x = position.x;
		this.y = position.y;
		this.velocity = random(-1.5, 1.5);
		this.size = size;
		this.color = Math.floor(random(0, 4));
		this.shape = Math.floor(random(0, 4));
	}

	draw() {
		noStroke();
		switch (this.color) {
			case 0:
				fill("#ED553B");
				break;
			case 1:
				fill("#3CAEA3");
				break;
			case 2:
				fill("#20639B");
				break;
			case 3:
				fill("#F6D55C");
				break;
		}
		ellipse(this.x, this.y, this.size);
		this.x += this.velocity;
		if (this.x > width + this.size) {
			this.x = 0 - this.size;
		}
		if (this.x < 0 - this.size) {
			this.x = width + this.size;
		}
	}
}

let slices = [];
let bg_circles = [];

let title = "¡Ruleta de Figuras!";
let font;

function setup() {

	// Canvas preparation
	createCanvas(windowWidth, windowHeight);
	pixelDensity(1);
	angleMode(RADIANS);
	ellipseMode(RADIUS);
	stroke("#FF");
	strokeWeight(4);
	textFont("Shadows Into Light");

	// Roulette offsets and sizes.
	roulette_size = height * 0.4;
	max_shape_width = roulette_size * 0.3;
	textSize(roulette_size / 12.5);

	// Initializing the slices in the roulette.
	slices.push(new Slice(RED, BLUE, SQUARE));
	slices.push(new Slice(GREEN, YELLOW, RECTANGLE));
	slices.push(new Slice(BLUE, RED, TRIANGLE));
	slices.push(new Slice(YELLOW, GREEN, CIRCLE));

	// Randomizing the starting spin of the roulette.
	initial_angle = random(0, 2 * PI);

	// Button for spinning the roulette.
	button = createButton("¡¡Girar!!");
	button.size(200, 60);
	button.position(button.position().x + width / 2 - 100, button.position().y - 80);
	button.mousePressed(clicked_spin_button);


	// Initialize the list of background circles.
	for (let i = 0; i < 50; i++) {
		bg_circles.push(new Circle(createVector(random(-30, width), random(0, height)), random(0.01 * height, 0.05 * height)));
	}
}

function draw() {
	background(225);

	for (const circle of bg_circles) {
		circle.draw();
	}
	stroke("#FF");
	textSize(width * 0.04);
	text(title, width * 0.04 * 0.25,  width * 0.04);

	noStroke();
	draw_arrow();

	translate(width / 2, (height / 2) - height * 0.07);

	// Initial random rotation.
	if (first_spin) {
		rotate(initial_angle);
	}

	// Reset angle to 0 if it's done a complete rotation.
	rotate(angle);
	if (angle > 2 * PI) {
		angle = 0;
	}


	// Update angles and rotation.
	if (should_spin) {
		// Increment the current angle.
		angle += delta_angle;

		// Decrease the velocity of the rotation every frame.
		delta_angle -= 0.002;

		// If the velocity has reached 0, hold it at 0.
		if (delta_angle < 0) {
			delta_angle = 0;
			should_remove_slice = true;
		}
	}

	// Draw the roulette wherever it may be.
	stroke("#FF");
	draw_slices(slices);

	// Handle the end of a spin.
	if (delta_angle == 0) {
		should_spin = false;
		if (should_remove_slice) {
			should_remove_slice = false;
			ready_to_spin = false;
		}
	}
}

function keyPressed() {
	if (keyCode == 32) {
		paused = !paused;
		if (paused) {
			noLoop();
		}
		else {
			loop();
		}
	}
}

function clicked_spin_button() {
	console.log("should_spin is: " + should_spin + " and ready_to_spin is: " + ready_to_spin);
	if (ready_to_spin == false) {
		loadPixels();
		remove_slice(get_pixel(Math.round(width / 2) + Math.round(roulette_size * 0.97), Math.round((height / 2) - height * 0.07)));
		ready_to_spin = true;
	}
	else {
		delta_angle = random(0.2, 0.5);
		should_spin = true;
		first_spin = false;
	}
}

function remove_slice(color_hex_string) {
	let index_to_erase = 0;
	for (let i = 0; i < slices.length; i++) {
		if (slices[i].slice_color === color_hex_string) {
			index_to_erase = i;
		}
	}
	slices.splice(index_to_erase, 1);
	slices_amount -= 1;
	for (let slice of slices) {
		slice.update_angle();
	}
}

function draw_slices(slices_list) {
	for (let slice of slices_list) {
		slice.draw();
	}
}

function get_pixel(x, y) {

	const red_index = width * 4 * y + 4 * x;
	const green_index = red_index + 1;
	const blue_index = red_index + 2;
	const pixel_color = new Color(pixels[red_index], pixels[green_index], pixels[blue_index]);

	let final_string = "#" + pixel_color.red.toString(16) + pixel_color.green.toString(16) + pixel_color.blue.toString(16);
	final_string = final_string.toUpperCase();

	console.log(final_string);
	return final_string;
}

function set_pixel(x, y, r, g, b) {

	const red_index = width * 4 * y + 4 * x;
	const green_index = red_index + 1;
	const blue_index = red_index + 2;

	pixels[red_index] = r;
	pixels[green_index] = g;
	pixels[blue_index] = b;
}

function draw_arrow() {
	fill(50);
	// stroke("#FF");
	const rect_x = width / 2 + roulette_size * 1.3;
	const rect_y = (height / 2) - height * 0.07 - roulette_size * 0.1;
	const rect_w = roulette_size * 0.5;
	const rect_h = roulette_size * 0.2;
	rect(rect_x, rect_y, rect_w, rect_h);
	triangle(rect_x * 1.01, rect_y - roulette_size * 0.15, rect_x * 1.01, rect_y + roulette_size * 0.15 + rect_h, rect_x - roulette_size * 0.285, rect_y + rect_h / 2);
}

function draw_square(max_width, slice_angle, color) {
	const half_slice_angle = slice_angle / 2;
	rotate(half_slice_angle);
	fill(color);
	rect(max_width * 2, -max_width / 2, max_width);
	noStroke();
	fill("#FF");
	text("Cuadrado", max_width * 0.3, max_width * 0.1);
	stroke("#FF");
	rotate(-half_slice_angle);
}

function draw_rectangle(max_width, slice_angle, color) {
	const half_slice_angle = slice_angle / 2;
	rotate(half_slice_angle);
	const rectangle_height = max_width * 0.6;
	fill(color);
	rect(max_width * 2, -rectangle_height / 2, max_width, rectangle_height);
	noStroke();
	fill("#FF");
	text("Rectángulo", max_width * 0.3, max_width * 0.1);
	stroke("#FF");
	rotate(-half_slice_angle);
}

function draw_circle(max_width, slice_angle, color) {
	const half_slice_angle = slice_angle / 2;
	rotate(half_slice_angle);
	fill(color);
	ellipse(max_width * 2.5, 0, max_width / 2);
	noStroke();
	fill("#FF");
	text("Círculo", max_width * 0.3, max_width * 0.1);
	stroke("#FF");
	rotate(-half_slice_angle);

}

function draw_triangle(max_width, slice_angle, color) {
	const triangle_height = Math.sqrt(Math.pow(max_width, 2) - Math.pow(max_width / 2, 2));
	const half_slice_angle = slice_angle / 2;
	const x_offset = roulette_size * 0.65;
	const y_offset = roulette_size * 0.15;
	rotate(half_slice_angle);
	fill(color);
	triangle(x_offset, y_offset, max_width + x_offset, y_offset, max_width / 2 + x_offset, -triangle_height + y_offset);
	noStroke();
	fill("#FF");
	text("Triángulo", max_width * 0.3, max_width * 0.1);
	stroke("#FF");
	rotate(-half_slice_angle);
}