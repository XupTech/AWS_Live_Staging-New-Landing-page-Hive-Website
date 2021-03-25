var IMAGES_SCHEMA={};

IMAGES_SCHEMA.IMAGES ={
	imagefor:String,
	image:String,
	img_name:String,
    img_path:String,
	status :{ type:Number, default:1 },
	background_option: { type:Number, default:1 },
	video: String
};
module.exports = IMAGES_SCHEMA;