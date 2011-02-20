/*

Supersized - Fullscreen Slideshow jQuery Plugin
Version 3.1
By Sam Dunn (www.buildinternet.com // www.onemightyroar.com)
Version: supersized.3.1.js
Website: www.buildinternet.com/project/supersized

*/

(function($){

	//Resize image on ready or resize
	jQuery.fn.supersized = function(options) {
	
		var base_path = null;
		var element = this;
		
		//Gather options
		if ( options ) {
			//Pull from both defaults and supplied options
			var options = $.extend( {}, $.fn.supersized.defaults, options);
		}else{
			//Only pull from default settings
			var options = $.extend( {}, $.fn.supersized.defaults);
		}
		
		
		$.inAnimation = false;
		$.paused = false;
		$.currentSlide = options.start_slide - 1;
		
		/******Set up initial Images -- Add class doesnt work*****/
		//Set previous image
		var imageLink = (options.slides[options.slides.length - 1].url) ? "href='" + options.slides[options.slides.length - 1].url + "'" : "";
		$("<img/>").attr("src", options.slides[options.slides.length - 1].image).appendTo(element).wrap("<a " + imageLink + "></a>");//Doesnt account for start slide
		
		//Set current image
		imageLink = (options.slides[$.currentSlide].url) ? "href='" + options.slides[$.currentSlide].url + "'" : "";
		$("<img/>").attr("src", options.slides[$.currentSlide].image).appendTo(element).wrap("<a class=\"activeslide\" " + imageLink + "></a>");
		
		//Set next image
		imageLink = (options.slides[$.currentSlide + 1].url) ? "href='" + options.slides[$.currentSlide + 1].url + "'" : "";
		$("<img/>").attr("src", options.slides[$.currentSlide + 1].image).appendTo(element).wrap("<a " + imageLink + "></a>");
		
		$(window).bind("load", function(){
			
			$('#loading').hide();
			element.fadeIn('fast');
			
			$('#controls-wrapper').show();
			
			
			
			//REVISIT
			if (options.thumbnail_navigation == 1){
			
				/*****Set up thumbnails****/
				//Load previous thumbnail
				$.currentSlide - 1 < 0  ? prevThumb = options.slides.length - 1 : prevThumb = $.currentSlide - 1;
				$('#prevthumb').show().html($("<img/>").attr("src", options.slides[prevThumb].image));
				
				//Load next thumbnail
				$.currentSlide == options.slides.length - 1 ? nextThumb = 0 : nextThumb = $.currentSlide + 1;
				$('#nextthumb').show().html($("<img/>").attr("src", options.slides[nextThumb].image));
		
			}
			
			resizenow(element, options);
			
			
			if (options.slide_captions == 1) $('#slidecaption').html(options.slides[$.currentSlide].title); //Pull caption from array
			if (options.navigation == 0) $('#navigation').hide();
			if (options.thumbnail_navigation == 0){ $('#nextthumb').hide(); $('#prevthumb').hide(); }
			
			//Slideshow
			if (options.slideshow == 1){
				if (options.slide_counter == 1){ //Initiate slide counter if active
					$('#slidecounter .slidenumber').html(options.start_slide);
	    			$('#slidecounter .totalslides').html(options.slides.length); //Pull total from length of array
	    		}
				slideshow_interval = setInterval(function(){ nextslide(element, options) }, options.slide_interval);
				
				if (options.thumbnail_navigation == 1){
					//Thumbnail Navigation
					$('#nextthumb').click(function() {
				    	if($.inAnimation) return false;
					    clearInterval(slideshow_interval);
					    nextslide(element, options);
					    if(!($.paused)) slideshow_interval = setInterval(function(){ nextslide(element, options) }, options.slide_interval);
					    return false;
				    });
				    $('#prevthumb').click(function() {
				    	if($.inAnimation) return false;
				        clearInterval(slideshow_interval);
				        prevslide(element, options);
				       	if(!($.paused)) slideshow_interval = setInterval(function(){ nextslide(element, options) }, options.slide_interval);
				        return false;
				    });
					}
				
				if (options.navigation == 1){ //Skip if no navigation
					$('#navigation a').click(function(){  
   						$(this).blur();  
   						return false;  
   					});
   					 
   					 	
					//Slide Navigation
					
					//Next Button
				    $('#nextslide').click(function() {
				    	if($.inAnimation) return false;
					    clearInterval(slideshow_interval);
					    nextslide(element, options);
					    if(!($.paused)) slideshow_interval = setInterval(function(){ nextslide(element, options) }, options.slide_interval);
					    return false;
				    });
				    
				    $('#nextslide').mousedown(function() {
					   	$(this).attr("src", "img/forward.png");
					});
					$('#nextslide').mouseup(function() {
					    $(this).attr("src", "img/forward_dull.png");
					});
					$('#nextslide').mouseout(function() {
					    $(this).attr("src", "img/forward_dull.png");
					});
				    
				    
				    //Previous Button
				    $('#prevslide').click(function() {
				    	if($.inAnimation) return false;
				        clearInterval(slideshow_interval);
				        prevslide(element, options);
				        if(!($.paused)) slideshow_interval = setInterval(function(){ nextslide(element, options) }, options.slide_interval);
				        return false;
				    });
					
					$('#prevslide').mousedown(function() {
					    $(this).attr("src", "img/back.png");
					});
					$('#prevslide').mouseup(function() {
					    $(this).attr("src", "img/back_dull.png");
					});
					$('#prevslide').mouseout(function() {
					    $(this).attr("src", "img/back_dull.png");
					});
					
					
				    //Play/Pause Button
				    $('#pauseplay').click(function() {
				    	if($.inAnimation) return false;
				    	var src = ($(this).attr("src") === "img/play_dull.png") ? "img/pause_dull.png" : "img/play_dull.png";
      					if (src == "img/pause_dull.png"){
      						$(this).attr("src", "img/play_dull.png");
      						$.paused = false;
					        slideshow_interval = setInterval(function(){ nextslide(element, options) }, options.slide_interval);  
				        }else{
				        	$(this).attr("src", "img/pause_dull.png");
				        	clearInterval(slideshow_interval);
				        	$.paused = true;
				        }
      					$(this).attr("src", src);
					    return false;
				    });
				}
			}
		});
				
		$(document).ready(function() {
			resizenow(element, options);
		});
		
		// Keyboard Navigation
		$(document.documentElement).keyup(function (event) {
			if (event.keyCode == 37) { //Left Arrow
				if($.inAnimation) return false;
				clearInterval(slideshow_interval);
				prevslide(element, options);
				if(!($.paused)) slideshow_interval = setInterval(function(){ nextslide(element, options) }, options.slide_interval);
				return false;
			} else if (event.keyCode == 39) { //Right Arrow
			    if($.inAnimation) return false;
			    clearInterval(slideshow_interval);
			    nextslide(element, options);
			    if(!($.paused)) slideshow_interval = setInterval(function(){ nextslide(element, options) }, options.slide_interval);
			    return false;
			} else if (event.keyCode == 32) { //Spacebar
				var t = '#pauseplay';
				if($.inAnimation) return false;
		    	var src = ($(t).attr("src") === "img/play_dull.png") ? "img/pause_dull.png" : "img/play_dull.png";
				
				if (src == "img/pause_dull.png"){
					$(t).attr("src", "img/play_dull.png");
					$.paused = false;
		        	slideshow_interval = setInterval(function(){ nextslide(element, options) }, options.slide_interval);  
	        	}else{
	        		$(t).attr("src", "img/pause_dull.png");
	        		clearInterval(slideshow_interval);
	        		$.paused = true;
	       		}
				
				$(t).attr("src", src);
			    return false;
			}
		});
		
		//Pause when hover on image
		$(element).hover(function() {
	   		if (options.slideshow == 1 && options.pause_hover == 1){
	   			if(!($.paused) && options.navigation == 1){
	   				$('#pauseplay').attr("src", "img/pause_dull.png"); 
	   				clearInterval(slideshow_interval);
	   			}
	   		}
	   		if($.inAnimation) return false; //*******Pull title from array
	   	}, function() {
			if (options.slideshow == 1 && options.pause_hover == 1){
				if(!($.paused) && options.navigation == 1){
					$('#pauseplay').attr("src", "img/pause_dull.png");
					slideshow_interval = setInterval(nextslide, options.slide_interval);
				} 
			}
				//*******Pull title from array
	   	});
		
		$(window).bind("resize", function(){
    		resizenow(element, options);  
		});
		
		element.hide();
		$('#controls-wrapper').hide();
	};
	
	//Adjust image size
	function resizenow (element, options) {
		var t = element;
	  	return t.each(function() {
	  		
			//Define image ratio
			var ratio = $('.activeslide img', t).height()/$('.activeslide img', t).width();
			
			//Gather browser and current image size
			var browserwidth = $(window).width();
			var browserheight = $(window).height();
			var offset;

			//Resize image to proper ratio
			if ((browserheight/browserwidth) > ratio){
			    t.height(browserheight);
			    t.width(browserheight / ratio);
			    t.children().height(browserheight);
			    t.children().width(browserheight / ratio);
			} else {
			    t.width(browserwidth);
			    t.height(browserwidth * ratio);
			    t.children().width(browserwidth);
			    t.children().height(browserwidth * ratio);
			}
			
			//Vertically Center
			if (options.vertical_center == 1){
				t.children().css('left', (browserwidth - t.width())/2);
				t.children().css('top', (browserheight - t.height())/2);
			}
			
			return false;
		});
	};
	
		//Slideshow Next Slide
	function nextslide(element, options) {
		
		if($.inAnimation) return false;
		else $.inAnimation = true;
	    
	    var slides = options.slides;
		
		var currentslide = $(element).find('.activeslide');
		currentslide.removeClass('activeslide');
		
	    if ( currentslide.length == 0 ) currentslide = $(element).find('a:last'); //*******Check if end of array?
			
	    var nextslide =  currentslide.next().length ? currentslide.next() : $(element).find('a:first'); //*******Array
		var prevslide =  nextslide.prev().length ? nextslide.prev() : $(element).find('a:last'); //*******Array
		
		$('.prevslide').removeClass('prevslide');
		prevslide.addClass('prevslide');
		
		//Get the slide number of new slide
		$.currentSlide + 1 == slides.length ? $.currentSlide = 0 : $.currentSlide++;
		
		
		/**** Image Loading ****/
		//Load next image
		loadSlide=false;
		$.currentSlide == slides.length - 1 ? loadSlide = 0 : loadSlide = $.currentSlide + 1;
		imageLink = (options.slides[loadSlide].url) ? "href='" + options.slides[loadSlide].url + "'" : "";
		$("<img/>").attr("src", options.slides[loadSlide].image).appendTo(element).wrap("<a " + imageLink + "></a>");
		
		if (options.thumbnail_navigation == 1){
		//Load previous thumbnail
		$.currentSlide - 1 < 0  ? prevThumb = slides.length - 1 : prevThumb = $.currentSlide - 1;
		$('#prevthumb').html($("<img/>").attr("src", options.slides[prevThumb].image));
		
		//Load next thumbnail
		nextThumb = loadSlide;
		$('#nextthumb').html($("<img/>").attr("src", options.slides[nextThumb].image));
		}
		
		currentslide.prev().remove(); //Remove Old Image
		
		/**** End Image Loading ****/
		
		//Display slide counter
		if (options.slide_counter == 1){
		    $('#slidecounter .slidenumber').html($.currentSlide + 1);//**display current slide after checking if last
		}
		
		//Captions
	    if (options.slide_captions == 1){
	    	(options.slides[$.currentSlide].title) ? $('#slidecaption').html(options.slides[$.currentSlide].title) : $('#slidecaption').html('') ; //*******Grab next slide's title from array
	    }
		
	    nextslide.hide().addClass('activeslide')
	    	if (options.transition == 0){
	    		nextslide.show(); $.inAnimation = false;
	    	}
	    	if (options.transition == 1){
	    		nextslide.fadeIn(750, function(){$.inAnimation = false;});
	    	}
	    	if (options.transition == 2){
	    		nextslide.show("slide", { direction: "up" }, 'slow', function(){$.inAnimation = false;});
	    	}
	    	if (options.transition == 3){
	    		nextslide.show("slide", { direction: "right" }, 'slow', function(){$.inAnimation = false;});
	    	}
	    	if (options.transition == 4){
	    		nextslide.show("slide", { direction: "down" }, 'slow', function(){$.inAnimation = false;});
	    	}
	    	if (options.transition == 5){
	    		nextslide.show("slide", { direction: "left" }, 'slow', function(){$.inAnimation = false;});
	    	}
	    	
	    resizenow(element, options);
	}
	
	//Slideshow Previous Slide
	function prevslide(element, options) {
	
		if($.inAnimation) {
			return false;
		}else{
			$.inAnimation = true;
		}

		var slides = options.slides;

		var currentslide = $(element).find('.activeslide');
	    currentslide.removeClass('activeslide');
		
	    if ( currentslide.length == 0 ) currentslide = $(element).find('a:first');
			
	    var nextslide =  currentslide.prev().length ? currentslide.prev() : $(element).find('a:last'); //****** If equal to total length of array
		var prevslide =  nextslide.next().length ? nextslide.next() : $(element).find('a:first');
				
		//Get current slide number
		$.currentSlide == 0 ?  $.currentSlide = slides.length - 1 : $.currentSlide-- ;
				
		/**** Image Loading ****/
		//Load next image
		loadSlide=false;
		$.currentSlide - 1 < 0  ? loadSlide = slides.length - 1 : loadSlide = $.currentSlide - 1;
		imageLink = (options.slides[loadSlide].url) ? "href='" + options.slides[loadSlide].url + "'" : "";
		$("<img/>").attr("src", options.slides[loadSlide].image).prependTo(element).wrap("<a " + imageLink + "></a>");
		
		if (options.thumbnail_navigation == 1){
		//Load previous thumbnail
		prevThumb = loadSlide;
		$('#prevthumb').html($("<img/>").attr("src", options.slides[prevThumb].image));
		
		//Load next thumbnail
		$.currentSlide == slides.length - 1 ? nextThumb = 0 : nextThumb = $.currentSlide + 1;
		$('#nextthumb').html($("<img/>").attr("src", options.slides[nextThumb].image));
		}
		
		currentslide.next().remove(); //Remove Old Image
		
		/**** End Image Loading ****/
		
		//Display slide counter
		if (options.slide_counter == 1){
		    $('#slidecounter .slidenumber').html($.currentSlide + 1);
		}
		
		$('.prevslide').removeClass('prevslide');
		prevslide.addClass('prevslide');
		
		//Captions
	    if (options.slide_captions == 1){
	    	(options.slides[$.currentSlide].title) ? $('#slidecaption').html(options.slides[$.currentSlide].title) : $('#slidecaption').html('') ; //*******Grab next slide's title from array
	    }
		
	    nextslide.hide().addClass('activeslide')
	    	if (options.transition == 0){
	    		nextslide.show(); $.inAnimation = false;
	    	}
	    	if (options.transition == 1){
	    		nextslide.fadeIn(750, function(){$.inAnimation = false;});
	    	}
	    	if (options.transition == 2){
	    		nextslide.show("slide", { direction: "down" }, 'slow', function(){$.inAnimation = false;});
	    	}
	    	if (options.transition == 3){
	    		nextslide.show("slide", { direction: "left" }, 'slow', function(){$.inAnimation = false;});
	    	}
	    	if (options.transition == 4){
	    		nextslide.show("slide", { direction: "up" }, 'slow', function(){$.inAnimation = false;});
	    	}
	    	if (options.transition == 5){
	    		nextslide.show("slide", { direction: "right" }, 'slow', function(){$.inAnimation = false;});
	    	}
	    	
	    	resizenow(element, options);//Fix for resize mid-transition
	}
	
	//Default Settings
	
	$.fn.supersized.defaults = {
			vertical_center         :   1,
			slideshow               :   1,
			navigation              :   1,
			thumbnail_navigation    :   0,
			transition              :   1,   //0-None, 1-Fade, 2-slide top, 3-slide right, 4-slide bottom, 5-slide left
			pause_hover             :   0,
			slide_counter           :   1,
			slide_captions          :   1,
			slide_interval          :   5000,
			start_slide             :   1
	};
	
})(jQuery);
