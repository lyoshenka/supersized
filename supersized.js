/*
	Supersized - Fullscreen Slideshow jQuery Plugin
	Flickr Edition Version 1.1.2
	www.buildinternet.com/project/supersized
	
	By Sam Dunn / One Mighty Roar (www.onemightyroar.com)
	Released under MIT License / GPL License
 */

(function($) {
  $.supersized = function( options ) {
    return {
      options: {},
      slides: [],
      newSlides: [],

      currentSlide: 0,

      inAnimation: false,	//Prevents animations from stacking
      isPaused: false,	  //Tracks paused on/off

      run: function(options) {
        var self = this;
        $(document).ready(function() {
          self.initOptions(options);
          self.init();
          self.initFlickr();
        });
        return self;
      },

      // if using hybrid performance mode, switch between speed and quality
      toggleHybridMode: function() {
        var self = this;
        if (self.options.performance == 1) {
          self.element.toggleClass('quality').toggleClass('speed');
        }
      },

      nextSlideIndex: function() {
        var self = this;
        return (self.currentSlide + 1) % self.slides.length;
      },

      prevSlideIndex: function() {
        var self = this;
        return (self.currentSlide - 1 + self.slides.length) % self.slides.length;
      },

      updateCaption: function() {
        var self = this;
        if (self.options.slide_captions) {
          $(self.options.slidecaption_selector).html(self.slides[self.currentSlide].title || '');
        }
      },

      updateSlideCounter: function() {
        var self = this;
        if (self.options.slide_counter) {
          $(self.options.slidecounter_slidenumber_selector).html(self.currentSlide + 1);
          $(self.options.slidecounter_totalslides_selector).html(self.slides.length);
        }
      },

      updateThumbnails: function() {
        var self = this;
        if (self.options.thumbnail_navigation == 1) {
          $(self.options.prevthumb_selector).html($("<img/>").attr("src", self.slides[self.prevSlideIndex()].thumb));
          $(self.options.nextthumb_selector).html($("<img/>").attr("src", self.slides[self.nextSlideIndex()].thumb));
        }
      },

      startAnimation: function() {
        var self = this;
        self.slideshow_interval = setInterval(self.nextSlideBound, self.options.slide_interval);
        if ($(self.options.pauseplay_selector).attr('src')) {
          $(self.options.pauseplay_selector).attr("src", self.options.image_path + "pause_dull.png");	//If image, swap to pause
        }
        self.isPaused = false;
      },

      pauseAnimation: function() {
        var self = this;
        clearInterval(self.slideshow_interval);
        if ($(self.options.pauseplay_selector).attr('src')) {
          $(self.options.pauseplay_selector).attr("src", self.options.image_path + "play_dull.png");
        }
        self.isPaused = true;
      },

      onPrevClick: function(e) {
        var self = this;
        e.preventDefault();
        if(!self.inAnimation) {
          clearInterval(self.slideshow_interval);	//Stop slideshow
          self.prevSlide();		//Go to previous slide
          if(!(self.isPaused)) {
            self.slideshow_interval = setInterval(self.nextSlideBound, self.options.slide_interval);
          }
        }
      },

      onNextClick: function(e) {
        var self = this;
        e.preventDefault();
        if(!self.inAnimation) {
          clearInterval(self.slideshow_interval);
          self.nextSlide();
          if(!(self.isPaused)) {
            self.slideshow_interval = setInterval(self.nextSlideBound, self.options.slide_interval);
          }
        }
      },

      init: function() {
        var self = this;

        //Add in Supersized elements
        $('body').prepend('<div id="supersized-loader"></div>').prepend('<div id="supersized"></div>');

        self.element = $('#supersized');		//Supersized container

        //If links should open in new window
        self.linkTarget = options.new_window ? ' target="_blank"' : '';

        self.nextSlideBound = self.nextSlide.bind(this);
        self.prevSlideBound = self.prevSlide.bind(this);

        //Set slideshow quality (Supported only in FF and IE, no Webkit)
        if (self.options.performance == 3){
          self.element.addClass('speed'); 		//Faster transitions
        }
        else if ((self.options.performance == 1) || (self.options.performance == 2)){
          self.element.addClass('quality');	//Higher image quality
        }

        self.element.hide();

        //Basic image drag and right click protection
        if (self.options.image_protect) {
          self.element.on('contextmenu', 'img', function() {
            return false;
          });
          self.element.on('mousedown', 'img', function() {
            return false;
          });
        }

        $(window).resize(self.resizeImages.bind(self)); // resize images on window resize
      },
      
      initOptions: function(options) {
        this.options = $.extend({
          // Selectors
          controls_selector: '#controls',
          pauseplay_selector: '#pauseplay',
          prevthumb_selector: '#prevthumb',
          nextthumb_selector: '#nextthumb',
          prevslide_selector: '#prevslide',
          nextslide_selector: '#nextslide',
          slidecaption_selector: '#slidecaption',
          slidecounter_slidenumber_selector: '#slidecounter .slidenumber',
          slidecounter_totalslides_selector: '#slidecounter .totalslides',



          //Functionality
          slideshow         : 1,		//Slideshow on/off
          autoplay          :	0,		//Slideshow starts playing automatically
          start_slide       : 1,		//Start slide (0 is random)
          random            : 0,		//Randomize slide order (Ignores start slide)
          slide_interval    : 5000,	//Length between transitions (in milliseconds)
          transition        : 1, 		//0-None, 1-Fade, 2-Slide Top, 3-Slide Right, 4-Slide Bottom, 5-Slide Left, 6-Carousel Right, 7-Carousel Left
          transition_speed  :	750,	//Speed of transition
          new_window				:	1,		//Image links open in new window/tab
          pause_hover       : 0,		//Pause slideshow on hover
          keyboard_nav      : 1,		//Keyboard navigation on/off
          performance				:	1,		//0-Normal, 1-Hybrid speed/quality, 2-Optimizes image quality, 3-Optimizes transition speed // (Only works for Firefox/IE, not Webkit)
          image_protect			:	1,		//Disables image dragging and right click with Javascript
          image_path				:	'img/', //Default image path for navigation control buttons
          
          //Size & Position
          min_width		        :   0,		//Min width allowed (in pixels)
          min_height		      :   0,		//Min height allowed (in pixels)
          vertical_center     :   1,		//Vertically center background
          horizontal_center   :   1,		//Horizontally center background
          fit_always         	:   0,		// Image will never exceed browser width or height (Ignores min. dimensions)
          fit_portrait        :   0,		//Portrait images will not exceed browser height
          fit_landscape       :   0,		//Landscape images will not exceed browser width
          
          //Components
          navigation              :   0,		//Slideshow controls on/off
          thumbnail_navigation    :   0,		//Thumbnail navigation
          slide_counter           :   1,		//Display slide numbers
          slide_captions          :   1,		//Slide caption (Pull from "title" in slides array)
          
          //Flickr
          source          :	2,          //1-Set, 2-User, 3-Group, 4-Tags
          set             : '###',      //Flickr set ID (found in URL)
          user            :	'###',      //Flickr user ID (http://idgettr.com/)
          group           :	'###',      //Flickr group ID (http://idgettr.com/)
          tags            : '###,###',  //Comma separated tags
          total_slides    :	100,        //How many pictures to pull (Between 1-500)
          image_size      : 'z',        //Flickr image Size - t,s,m,z,b  (Details: http://www.flickr.com/services/api/misc.urls.html)
          sort_by         : 1,          //1-Date Posted, 2-Date Taken, 3-Interestingness
          sort_direction  : 0,          //0-descending, 1-ascending
          
          /**
            FLICKR API KEY. NEED TO GET YOUR OWN -- http://www.flickr.com/services/apps/create/
           **/
          api_key					:	'#############'		//Flickr API Key
        }, options || {});
      },

      initFlickr: function() {
        var self = this,
            sortOrder = '',
            flickrURL = '';


        switch(self.options.sort_by){
          case 2:
            sortOrder = 'date-taken';
            break;
          case 3:
            sortOrder = 'interestingness';
            break;
          default:
            sortOrder = 'date-posted';
            break;
        }
        sortOrder = sortOrder + (self.options.sort_direction == 1 ? '-asc' : '-desc');

        switch(self.options.source){
          case 1:		//From a Set
            flickrURL =  'http://api.flickr.com/services/rest/?&method=flickr.photosets.getPhotos&api_key=' + self.options.api_key + '&photoset_id=' + self.options.set + '&per_page=' + self.options.total_slides + '&sort=' + sortOrder + '&format=json&jsoncallback=?';
            break;
          case 2:		//From a User
            flickrURL =  'http://api.flickr.com/services/rest/?format=json&method=flickr.photos.search&api_key=' + self.options.api_key + '&user_id=' + self.options.user + '&per_page=' + self.options.total_slides + '&sort=' + sortOrder + '&jsoncallback=?';
            break;
          case 3:		//From a Group
            flickrURL =  'http://api.flickr.com/services/rest/?format=json&method=flickr.photos.search&api_key=' + self.options.api_key + '&group_id=' + self.options.group + '&per_page=' + self.options.total_slides + '&sort=' + sortOrder + '&jsoncallback=?';
            break;
          case 4:		//From tags
            flickrURL =  'http://api.flickr.com/services/rest/?format=json&method=flickr.photos.search&api_key=' + self.options.api_key + '&tags=' + self.options.tags + '&per_page=' + self.options.total_slides + '&sort=' + sortOrder + '&jsoncallback=?';
            break;
        }

        $.ajax({
          type: 'GET',
          url: flickrURL,
          dataType: 'json',
          async: true,
          success: function(data){
            self.newSlides = (self.options.source == 1) ? data.photoset.photo : data.photos.photo;
            if (!self.newSlides.length)
            {
              alert('no pictures loaded from flickr');
            }
            else
            {
              self.loadSlides();
            }
          }
        });
      },


      loadSlides: function() {
        var self = this,
            slides = [],
            imageLink = '';

        //Build slides array from flickr request
        $.each(self.newSlides, function(i,item){
          slides.push({
            image : 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_' + self.options.image_size + '.jpg',
            thumb : 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_t.jpg',
            title : item.title ,
            url   : 'http://www.flickr.com/photos/' + item.owner + '/' + item.id + '/'
          });
        });
        self.slides = slides;

        //Shuffle slide order if needed
        if (self.options.random) {
          for(var j, x, i = slides.length; i; j = parseInt(Math.random() * i), x = slides[--i], slides[i] = slides[j], slides[j] = x);	//Fisher-Yates shuffle algorithm (jsfromhell.com/array/shuffle)
        }
        else if (self.options.start_slide) {
          self.currentSlide = Math.max(self.options.start_slide, slides.length) - 1;
        }

        if (slides.length > 1) {
          //Set previous image
          var prevSlide = self.prevSlideIndex();
          imageLink = (slides[prevSlide].url) ? "href='" + slides[prevSlide].url + "'" : "";
          $("<img/>").attr("src", slides[prevSlide].image).appendTo(self.element).wrap('<a ' + imageLink + self.linkTarget + '></a>');
        }

        //Set current image
        imageLink = (slides[self.currentSlide].url) ? "href='" + slides[self.currentSlide].url + "'" : "";
        $("<img/>").attr("src", slides[self.currentSlide].image).appendTo(self.element).wrap('<a class="activeslide" ' + imageLink + self.linkTarget + '></a>');
        $('.activeslide img').on('load', self.resizeImages.bind(self)); // resize after load, otherwise its not centered correctly

        if (slides.length > 1){
          //Set next image
          var nextSlide = self.nextSlideIndex();
          imageLink = (slides[nextSlide].url) ? "href='" + slides[nextSlide].url + "'" : "";
          $("<img/>").attr("src", slides[nextSlide].image).appendTo(self.element).wrap('<a ' + imageLink + self.linkTarget + '></a>');
        }

        self.start();
      },

      start: function() {
        var self = this;

        self.resizeImages();

        $('#supersized-loader').remove();		//Hide loading animation
        self.element.fadeIn('fast');			//Fade in background

        self.updateSlideCounter();
        self.updateCaption();
        self.updateThumbnails();


        if (self.options.slideshow) {
          if (self.options.autoplay) {
            self.startAnimation();
          }

          self.initNavigation();
        }
      },

      initNavigation: function() {
        var self = this;
        if (!self.options.navigation) {
          return
        };

        $(self.options.controls_selector).show();

        $(self.options.pauseplay_selector).click(function(e) {
          e.preventDefault();
          if(!self.inAnimation) {
            if (self.isPaused){
              self.startAnimation();
            }
            else{
              self.pauseAnimation();
            }
          }
        });

        $(self.options.prevslide_selector).click(self.onPrevClick.bind(self));
        $(self.options.nextslide_selector).click(self.onNextClick.bind(self));

        if (self.options.thumbnail_navigation) {
          $(self.options.prevthumb_selector).show().click(self.onPrevClick.bind(self));
          $(self.options.nextthumb_selector).show().click(self.onNextClick.bind(self));
        };

        if ($(self.options.nextslide_selector).attr('src')) {
          $(self.options.nextslide_selector)
          .on('mousedown', function() {
            $(this).attr("src", self.options.image_path + "forward.png");
          })
          .on('mouseup mouseout', function() {
            $(this).attr("src", self.options.image_path + "forward_dull.png");
          });
        }

        if ($(self.options.prevslide_selector).attr('src')){
          $(self.options.prevslide_selector)
          .on('mouseup', function() {
            $(this).attr("src", self.options.image_path + "back.png");
          })
          .on('mouseup mouseout', function() {
            $(this).attr("src", self.options.image_path + "back_dull.png");
          });
        }
      },

      resizeImages: function() {
        var self = this;
        return self.element.find('img').each(function() {
          var thisSlide = $(this),
              ratio = (thisSlide.height()/thisSlide.width()).toFixed(2),	//Define image ratio
              browserwidth = $(window).width(),
              browserheight = $(window).height();

          if (self.options.fit_always) { // Fit always is enabled
            if ((browserheight/browserwidth) > ratio) {
              self.resizeWidth(thisSlide);
            }
            else {
              self.resizeHeight(thisSlide);
            }
          }
          else if ((browserheight <= self.options.min_height) && (browserwidth <= self.options.min_width)) {	//If window smaller than minimum width and height
            if ((browserheight/browserwidth) > ratio) {
              self.options.fit_landscape && ratio <= 1 ? self.resizeWidth(thisSlide,true) : self.resizeHeight(thisSlide,true);	//If landscapes are set to fit
            }
            else {
              self.options.fit_portrait && ratio > 1 ? self.resizeHeight(thisSlide,true) : self.resizeWidth(thisSlide,true);		//If portraits are set to fit
            }
          } 
          else if (browserwidth <= self.options.min_width) {		//If window only smaller than minimum width
            if ((browserheight/browserwidth) > ratio){
              self.options.fit_landscape && ratio <= 1 ? resizeWidth(thisSlide,true) : resizeHeight(thisSlide);	//If landscapes are set to fit
            }
            else {
              self.options.fit_portrait && ratio > 1 ? resizeHeight(thisSlide) : resizeWidth(thisSlide,true);		//If portraits are set to fit
            }
          } 
          else if (browserheight <= self.options.min_height) {	//If window only smaller than minimum height
            if ((browserheight/browserwidth) > ratio){
              self.options.fit_landscape && ratio <= 1 ? resizeWidth(thisSlide) : resizeHeight(thisSlide,true);	//If landscapes are set to fit
            } else {
              self.options.fit_portrait && ratio > 1 ? resizeHeight(thisSlide,true) : resizeWidth(thisSlide);		//If portraits are set to fit
            }
          }
          else {	//If larger than minimums
            if ((browserheight/browserwidth) > ratio) {
              self.options.fit_landscape && ratio <= 1 ? resizeWidth(thisSlide) : resizeHeight(thisSlide);	//If landscapes are set to fit
            }
            else {
              self.options.fit_portrait && ratio > 1 ? resizeHeight(thisSlide) : resizeWidth(thisSlide);		//If portraits are set to fit
            }
          }

          //Horizontally Center
          if (self.options.horizontal_center) {
            $(this).css('left', (browserwidth - thisSlide.width())/2);
          }

          //Vertically Center
          if (self.options.vertical_center) {
            $(this).css('top', (browserheight - thisSlide.height())/2);
          }
        });
      },

      resizeWidth: function (thisSlide, minimum) {
        var self = this,
            ratio = (thisSlide.height()/thisSlide.width()).toFixed(2),	//Define image ratio
            browserwidth = $(window).width(),
            browserheight = $(window).height();


        if (minimum) {	//If minimum height needs to be considered
          if(thisSlide.width() < browserwidth || thisSlide.width() < self.options.min_width ) {
            if (thisSlide.width() * ratio >= self.options.min_height) {
              thisSlide.width(self.options.min_width);
              thisSlide.height(thisSlide.width() * ratio);
            }
            else {
              self.resizeHeight(thisSlide);
            }
          }
        }
        else {
          if (self.options.min_height >= browserheight && !self.options.fit_landscape) {	//If minimum height needs to be considered
            if (browserwidth * ratio >= self.options.min_height || (browserwidth * ratio >= self.options.min_height && ratio <= 1)) {	//If resizing would push below minimum height or image is a landscape
              thisSlide.width(browserwidth);
              thisSlide.height(browserwidth * ratio);
            }
            else if (ratio > 1){		//Else the image is portrait
              thisSlide.height(self.options.min_height);
              thisSlide.width(thisSlide.height() / ratio);
            }
            else if (thisSlide.width() < browserwidth) {
              thisSlide.width(browserwidth);
              thisSlide.height(thisSlide.width() * ratio);
            }
          }
          else {	//Otherwise, resize as normal
            thisSlide.width(browserwidth);
            thisSlide.height(browserwidth * ratio);
          }
        }
      },

      resizeHeight: function(thisSlide, minimum) {
        var self = this,
            ratio = (thisSlide.height()/thisSlide.width()).toFixed(2),	//Define image ratio
            browserwidth = $(window).width(),
            browserheight = $(window).height();

        if (minimum){	//If minimum height needs to be considered
          if(thisSlide.height() < browserheight) {
            if (thisSlide.height() / ratio >= self.options.min_width) {
              thisSlide.height(self.options.min_height);
              thisSlide.width(thisSlide.height() / ratio);
            }
            else {
              self.resizeWidth(thisSlide, true);
            }
          }
        }
        else {	//Otherwise, resized as normal
          if (self.options.min_width >= browserwidth) {	//If minimum width needs to be considered
            if (browserheight / ratio >= self.options.min_width || ratio > 1) {	//If resizing would push below minimum width or image is a portrait
              thisSlide.height(browserheight);
              thisSlide.width(browserheight / ratio);
            } 
            else if (ratio <= 1) {		//Else the image is landscape
              thisSlide.width(self.options.min_width);
              thisSlide.height(thisSlide.width() * ratio);
            }
          }
          else {	//Otherwise, resize as normal
            thisSlide.height(browserheight);
            thisSlide.width(browserheight / ratio);
          }
        }
      },

      nextSlide: function(reverse) {
        var self = this;
        if (self.inAnimation) {
          return false;		//Abort if currently animating
        }
        else {
          self.inAnimation = true;		//Otherwise set animation marker
        }

        var currentSlide = self.element.find('.activeslide'),
            nextSlide = currentSlide.next().length ? currentSlide.next() : self.element.find('a:first'),
            prevSlide = currentSlide.prev().length ? currentSlide.prev() : self.element.find('a:last');

        if (reverse)
        {
          var temp = nextSlide;
          nextSlide = prevSlide;
          prevSlide = temp;
        }

        // Current slide is now previous slide
        self.element.find('.prevslide').removeClass('prevslide');
        currentSlide.removeClass('activeslide').addClass('prevslide');

        self.toggleHybridMode();
        
        nextSlide.hide().addClass('activeslide');	//Update active slide
        self.doTransition(currentSlide, nextSlide, reverse);

        self.currentSlide = (self.currentSlide + (reverse ? self.slides.length - 1 : 1)) % self.slides.length;
        self.updateSlideCounter();
        self.updateCaption();
        self.updateThumbnails();

        // remvoe old image
        prevSlide.remove();
        // load next image
        var loadSlide = reverse ? self.prevSlideIndex() : self.nextSlideIndex(),
            imageLink = (self.slides[loadSlide].url) ? "href='" + self.slides[loadSlide].url + "'" : "";	//If link exists, build it
        $("<img/>").attr("src", self.slides[loadSlide].image)[reverse ? 'prependTo' : 'appendTo'](self.element).wrap("<a " + imageLink + self.linkTarget + "></a>");	//Append new image
      },

      //Previous Slide
      prevSlide: function() { this.nextSlide(true); },

      doTransition: function(oldSlide, newSlide, reverse) {
        var self = this,
            mult = reverse ? -1 : 1, // usually we advance to the right. if reverse, we advance to the left (go backwards)
            width = $(window).width() * mult,
            height = $(window).height() * mult;

        switch(self.options.transition) {
          case 0:    //No transition
            newSlide.show();
            self.inAnimation = false;
            break;
          case 1:    //Fade
            newSlide.fadeTo(self.options.transition_speed, 1, self.afterAnimation.bind(self));
            break;
          case 2:    //Slide Top
            newSlide.animate({top : -height}, 0 ).show().animate({top:0}, self.options.transition_speed, self.afterAnimation.bind(self));
            break;
          case 3:    //Slide Right
            newSlide.animate({left : width}, 0 ).show().animate({left:0}, self.options.transition_speed, self.afterAnimation.bind(self));
            break;
          case 4:    //Slide Bottom
            newSlide.animate({top : height}, 0 ).show().animate({top:0}, self.options.transition_speed, self.afterAnimation.bind(self));
            break;
          case 5:    //Slide Left
            newSlide.animate({left : -width}, 0 ).show().animate({left:0}, self.options.transition_speed, self.afterAnimation.bind(self));
            break;
          case 6:    //Carousel Right
            newSlide.animate({left : width}, 0 ).show().animate({left:0}, self.options.transition_speed, self.afterAnimation.bind(self));
            oldSlide.animate({left: -width}, self.options.transition_speed );
            break;
          case 7:    //Carousel Left
            newSlide.animate({left : -width}, 0 ).show().animate({left:0}, self.options.transition_speed, self.afterAnimation.bind(self));
            oldSlide.animate({left: width}, self.options.transition_speed );
            break;
        };
      },

      //After slide animation
      afterAnimation: function() {
        var self = this;
        self.inAnimation = false;
        self.toggleHybridMode();
        self.resizeImages();
      }
    }.run(options);

    
    //Keyboard Navigation
    //    if (this.options.keyboard_nav){
    //
    //      $(document.documentElement).keydown(function (event) {
    //
    //        if ((event.keyCode == 37) || (event.keyCode == 40)) { //Left Arrow or Down Arrow
    //
    //          if ($(self.options.prevslide_selector).attr('src')) $(self.options.prevslide_selector).attr("src", image_path + "back.png");		//If image, change back button to active
    //
    //        } else if ((event.keyCode == 39) || (event.keyCode == 38)) { //Right Arrow or Up Arrow
    //
    //          if ($(self.options.nextslide_selector).attr('src')) $(self.options.nextslide_selector).attr("src", image_path + "forward.png");	//If image, change next button to active
    //
    //        }
    //
    //      });
    //
    //      $(document.documentElement).keyup(function (event) {
    //
    //        clearInterval(slideshow_interval);	//Stop slideshow, prevent buildup
    //
    //        if ((event.keyCode == 37) || (event.keyCode == 40)) { //Left Arrow or Down Arrow
    //
    //          if ($(self.options.prevslide_selector).attr('src')) $(self.options.prevslide_selector).attr("src", image_path + "back_dull.png");	//If image, change back button to normal
    //
    //          if(inAnimation) return false;		//Abort if currently animating
    //
    //          clearInterval(slideshow_interval);	//Stop slideshow
    //          prevSlide();		//Go to previous slide
    //
    //          if(!(isPaused)) slideshow_interval = setInterval(nextslide, this.options.slide_interval);	//If not paused, resume slideshow
    //
    //          return false;
    //
    //        } else if ((event.keyCode == 39) || (event.keyCode == 38)) { //Right Arrow or Up Arrow
    //
    //          if ($(self.options.nextslide_selector).attr('src')) $(self.options.nextslide_selector).attr("src", image_path + "forward_dull.png");	//If image, change next button to normal
    //
    //          if(inAnimation) return false;		//Abort if currently animating
    //
    //          clearInterval(slideshow_interval);	//Stop slideshow
    //          nextslide();		//Go to next slide
    //
    //          if(!(isPaused)) slideshow_interval = setInterval(nextslide, this.options.slide_interval);	//If not paused, resume slideshow
    //
    //          return false;
    //
    //        } else if (event.keyCode == 32) { //Spacebar
    //
    //          if(inAnimation) return false;		//Abort if currently animating
    //
    //          if (isPaused){
    //
    //            if ($(self.options.pauseplay_selector).attr('src')) $(self.options.pauseplay_selector).attr("src", image_path + "pause_dull.png");	//If image, swap to pause
    //
    //            //Resume slideshow
    //            isPaused = false;
    //            slideshow_interval = setInterval(nextslide, this.options.slide_interval);
    //
    //          }else{
    //
    //            if ($(self.options.pauseplay_selector).attr('src')) $(self.options.pauseplay_selector).attr("src", image_path + "play_dull.png");	//If image, swap to play
    //
    //            //Mark as paused
    //            isPaused = true;
    //
    //          }
    //
    //          return false;
    //        }
    //
    //      });
    //    }
		
		
    //Pause when hover on image
    //    if (this.slideshow && this.options.pause_hover) {
    //      $(element).hover(function() {
    //
    //        if(inAnimation) return false;		//Abort if currently animating
    //
    //        if(!(isPaused) && this.options.navigation){
    //
    //          if ($(self.options.pauseplay_selector).attr('src')) $(self.options.pauseplay_selector).attr("src", image_path + "pause.png"); 	//If image, swap to pause
    //          clearInterval(slideshow_interval);
    //
    //        }
    //
    //      }, function() {
    //
    //        if(!(isPaused) && this.options.navigation){
    //
    //          if ($(self.options.pauseplay_selector).attr('src')) $(self.options.pauseplay_selector).attr("src", image_path + "pause_dull.png");	//If image, swap to active
    //          slideshow_interval = setInterval(nextslide, this.options.slide_interval);
    //
    //        }
    //
    //      });
    //    }
  };	
})(jQuery);

