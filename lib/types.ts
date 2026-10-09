export type Item = {id:string; name:string; slug:string; price:number|null; sale_price?:number|null; height?:string; category_id?:string; category_slug?:string|null; description:string; dimensions_or_set_details?:string; image_url:string; gallery_images:string[]; is_in_stock:boolean; is_featured:boolean};
export type Category={id:string;name:string;slug:string;sort_order:number;group_slug?:string;kind?:'plant'|'furniture'};
export type Service={id:string;title:string;slug:string;description:string;image_url:string;sort_order:number};
export type Video={id:string;title:string;video_url:string;thumbnail_url:string;duration:string;sort_order:number;created_at?:string};
export type Settings={id:number;phone:string;address:string;google_maps_url:string;google_maps_embed_url:string;working_hours:string;facebook_url:string;instagram_url:string;whatsapp_url:string;messenger_url:string};

export type GardenStory={id:string;title:string;slug:string;excerpt:string;body:string;image_url:string;is_published:boolean;sort_order:number;created_at?:string;updated_at?:string};
