
/* 
 *************************************
 * <!-- Advanced Slider (Special Effects) -->
 *************************************
 */
theme = ( function ( theme, $, window, document ) {
    'use strict';
    
    var documentReady = function( $ ) {
		
	
		var $window                   = $( window ),
			windowWidth               = $window.width(),
			windowHeight              = $window.height(),
			animDuration              = 600,
			
			//Basic webGL renderers 
			rendererOuterID           = 'custom-advanced-slider-sp-canvas-outer',
			rendererID                = 'custom-advanced-slider-sp-canvas',
			renderer,
		    
			//---
			renderer_filter,
		    rendererID_filter         = rendererID,
		    stage_filter,
			items_container,
			displacementSprite,
			displacementFilter,
			
			//---
			scenesAll                 = [],
			webGLRenderer;
		
		
		
		advancedSliderInit();
		
		$window.on( 'resize', function() {
			// Check window width has actually changed and it's not just iOS triggering a resize event on scroll
			if ( $window.width() != windowWidth ) {

				// Update the window width for next time
				windowWidth = $window.width();

				advancedSliderInit();
				
			}
		});
		

		
		/*
		 * Initialize embedded local video.
		 *
		 * @param  {object} wrapper          - The outermost video container, which can contain multiple videos
		 * @param  {boolean} play            - Forced to trigger pause or play events.
		 * @return {void}                    - The constructor.
		 */
		function advancedSliderVideoEmbedInit( wrapper, play ) {
			wrapper.find( '.slider-video-embed' ).each( function()  {
				var $this          = $( this ),
					videoWrapperW  = $this.closest( '.custom-advanced-slider-outer' ).width(),
					videoWrapperH  = $this.closest( '.custom-advanced-slider-outer' ).height(),
					curVideoID     = $this.find( '.video-js' ).attr( 'id' ),
					coverPlayBtnID = 'videocover-' + curVideoID,
					dataControls   = $this.data( 'embed-video-controls' ),
					dataAuto       = $this.data( 'embed-video-autoplay' ),
					dataLoop       = $this.data( 'embed-video-loop' ),
					dataW          = $this.data( 'embed-video-width' ),
					dataH          = $this.data( 'embed-video-height' ),
					$replayBtn     = $( '#'+curVideoID+'-replay-btn' );
				
				if ( videoWrapperH == 0 ) videoWrapperH = videoWrapperW/1.77777777777778;

			
				if( typeof dataAuto === typeof undefined ) {
					dataAuto = true;
				}
				if( typeof dataLoop === typeof undefined ) {
					dataLoop = true;
				}
				

				if( typeof dataControls === typeof undefined ) {
					dataControls = false;
				}	
				
				if( typeof dataW === typeof undefined || dataW == 'auto' ) {
					dataW = videoWrapperW;
				}	

				if( typeof dataH === typeof undefined || dataH == 'auto' ) {
					dataH = videoWrapperH;
				}

				

				//Display cover and play buttons when some mobile device browsers cannot automatically play video
				if ( $( '#' + coverPlayBtnID ).length == 0 ) {
					$( '<div id="'+coverPlayBtnID+'"><span class="cover-show" style="background-image:url('+$this.find( 'video' ).attr( 'poster' )+')"></span><span class="cover-play"></span></div>' ).insertBefore( $this );


					var btnEv = ( Modernizr.touchevents ) ? 'touchstart' : 'click';
					$( '#' + coverPlayBtnID + ' .cover-play' ).on( btnEv, function( e ) {
						e.preventDefault();

						myPlayer.play();

						$( '#' + coverPlayBtnID ).hide();

					});

				}
				
				
				//Add replay button to video 
				if ( $replayBtn.length == 0 ) {
					$this.after( '<span class="web-video-replay" id="'+curVideoID+'-replay-btn"></span>' );
				}
				
				
				//HTML5 video autoplay on mobile revisited
				if ( dataAuto && windowWidth <= 768 ) {
					$this.find( '.video-js' ).attr({
						'autoplay'    : 'true',
						'muted'       : 'true',
						'playsinline' : 'true'
					});
				}

				var myPlayer = videojs( curVideoID, {
										  width     : dataW,
										  height    : dataH,
										  loop      : dataLoop,
										  controlBar: {
											  muteToggle : false,
											  autoplay   : dataAuto,
											  loop       : dataLoop,
											  controls   : true,
											  controlBar : {
												  muteToggle: false
											  }
										  }


										});


				
				
				myPlayer.ready(function() {
					
					
					/* ---------  Video initialize */
					myPlayer.on( 'loadedmetadata', function() {

						//Get Video Dimensions
						var curW    = this.videoWidth(),
							curH    = this.videoHeight(),
							newW    = curW,
							newH    = curH;

						newW = videoWrapperW;

						//Scaled/Proportional Content 
						newH = curH*(newW/curW);


						if ( !isNaN( newW ) && !isNaN( newH ) )  {
							myPlayer
								.width( newW )
								.height( newH );	
							
							$this.css( 'height', newH );
						}



						//Show this video wrapper
						$this.css( 'visibility', 'visible' );

						//Hide loading effect
						$this.find( '.vjs-loading-spinner, .vjs-big-play-button' ).hide();

					});		

		
				
					/* ---------  Set, tell the player it's in fullscreen  */
					if ( dataAuto ) {
						myPlayer.play();
					}


					/* ---------  Disable control bar play button click */
					if ( !dataControls ) {
						myPlayer.controls( false );
					}
					
					
					/* ---------  Determine if the video is auto played from mobile devices  */
					var autoPlayOK = false;

					myPlayer.on( 'timeupdate', function() {

						var duration = this.duration();
						if ( duration > 0 ) {
							autoPlayOK = true;
							if ( this.currentTime() > 0 ) {
								autoPlayOK = true;
								this.off( 'timeupdate' );

								//Hide cover and play buttons when the video automatically played
								$( '#' + coverPlayBtnID ).hide();
							} 

						}

					});
				

					
					/* ---------  Pause the video when it is not current slider  */
					if ( !play ) {
						myPlayer.pause();
						myPlayer.currentTime(0);
						
					} else {
						if ( dataAuto ) {

							myPlayer.currentTime(0);
							myPlayer.play();
							$replayBtn.hide();

							//Should the video go to the beginning when it ends
							myPlayer.on( 'ended', function () { 
								
								if ( dataLoop ) {
									myPlayer.currentTime(0);
									myPlayer.play();	
								} else {
									//Replay this video
									myPlayer.currentTime(0);
									
									$replayBtn
										.show()
										.off( 'click' )
										.on( 'click', function( e ) {
											e.preventDefault();

											myPlayer.play();
											$replayBtn.hide();

										});						
								}
							
							});		


						}	
					}
					

				});

			});	
		}	
		
		
		
		/*
		 * Initialize slideshow
		 *
		 * @return {void}                   - The constructor.
		 */
        function advancedSliderInit() {
			
			var $advSlider = $( '.custom-advanced-slider-sp' );
			$advSlider.each( function()  {

				var $this                    = $( this ),
					$items                   = $this.find( '.item' ),
					total                    = $items.length,
					timerEvtStop             = null,
					dataControlsPagination   = $this.data( 'controls-pagination' ),
					dataControlsArrows       = $this.data( 'controls-arrows' ),
					dataLoop                 = $this.data( 'loop' ),
					dataAuto                 = $this.data( 'auto' ),
					dataTiming               = $this.data( 'timing' ),
					dataFilterTexture        = $this.data( 'filter-texture' );


				if( typeof dataControlsPagination === typeof undefined ) dataControlsPagination = '.custom-advanced-slider-sp-pagination';
				if( typeof dataControlsArrows === typeof undefined ) dataControlsArrows = '.custom-advanced-slider-sp-arrows';
				if( typeof dataLoop === typeof undefined ) dataLoop = false;
				if( typeof dataAuto === typeof undefined ) dataAuto = false;	
				if( typeof dataTiming === typeof undefined ) dataTiming = 10000;
				if( typeof dataFilterTexture === typeof undefined ) dataFilterTexture = '';



			
				//Initialize the slider style
				//-------------------------------------	
				$items.first().addClass( 'active' );
				
			
				//Check if the picture is loaded on the page
				var $curImg, 
					realSrc,
					curImgH    = false,
					img        = new Image();

				if ( $items.first().find( 'img' ).length == 0 ) {
					$curImg    = $items.first().find( 'video' );
					realSrc    = $curImg.attr( 'poster' );
				} else {
					$curImg    = $items.first().find( 'img' );
					realSrc    = $curImg.attr( 'src' );	
				}


				img.onload = function() {

					curImgH = img.height*(img.width/windowWidth);
					$this.css( 'height', curImgH + 'px' );
					
					var realImgW = this.width,
						realImgH = this.height;

					
					
					//Load slides to canvas
					//-------------------------------------	
					if ( $( '#' + rendererID ).length == 0 ) {
						$this.prepend( '<div id="'+rendererOuterID+'" class="custom-advanced-slider-sp-canvas-outer"><canvas id="'+rendererID+'"></canvas></div>' );
					}
					
					//Basic webGL renderers 
					//-------------------------------------
					renderer              = new PIXI.Application( $this.width(), $this.height(), {
															backgroundColor : 0x000000, 
															autoResize      : true, 
															view            : document.getElementById( rendererID )
														});
					
					renderer_filter       = new PIXI.autoDetectRenderer( $this.width(), $this.height(), {
															backgroundColor : 0x000000, 
															transparent     : false,
															view            : document.getElementById( rendererID_filter )
														});


				    stage_filter          = new PIXI.Container();
					items_container       = new PIXI.Container();
					displacementSprite    = ( dataFilterTexture.indexOf( '.mp4' ) >= 0 ) ? new PIXI.Sprite( PIXI.Texture.fromVideo( dataFilterTexture ) ) : new PIXI.Sprite.fromImage( dataFilterTexture );
					displacementFilter    = new PIXI.filters.DisplacementFilter( displacementSprite );
					

					
					
                    //Add sprites to stage
                    //Usage of returning sprite object: renderer.stage.children[index]


					//----------------------------------------------------------------------------------
					//--------------------------------- Brightness Effect -------------------------------	
					//----------------------------------------------------------------------------------
					if ( $this.hasClass( 'eff-brightness' ) ) {
						
						$this.find( '.item' ).each( function( index )  {

							var $thisItem = $( this );

							//Load sprite from each slider to canvas
							//-------------------------------------
							var curSprite;

							if ( $thisItem.find( 'video' ).length > 0 ) {
				
								
								// create a video texture from a path
								var texture = PIXI.Texture.fromVideo( $thisItem.find( 'source[type="video/mp4"]' ).attr( 'src' ) );

								curSprite = new PIXI.Sprite( texture );
								
								// pause the video
								var videoSource = texture.baseTexture.source;
								videoSource.autoplay = false;
								videoSource.pause();
								videoSource.currentTime = 0;
								videoSource.muted = true;

								

								var myPlayer = videojs( $thisItem.find( 'video' ).attr( 'id' ) );
								myPlayer.ready(function() {


									/* ---------  Video initialize */
									myPlayer.on( 'loadedmetadata', function() {

										//Get Video Dimensions
										var curW    = this.videoWidth(),
											curH    = this.videoHeight(),
											newW    = curW,
											newH    = curH;

										newW = $this.width();

										//Scaled/Proportional Content 
										newH = curH*(newW/curW);

										curSprite.width  = newW;
										curSprite.height = newH;	


									});		

								});




							} else {
								curSprite = new PIXI.Sprite.fromImage( $thisItem.find( 'img' ).attr( 'src' ) );
								curSprite.width  = $this.width();
								curSprite.height = $this.height();	
							}



							// Render updated scene
							renderer.stage.addChild( curSprite );

							TweenLite.set( curSprite, {
								alpha : 0
							});	



						});
		
						
					}// end effect


					


					//----------------------------------------------------------------------------------
					//--------------------------------- Liquid Distortion Effect -----------------------
					//----------------------------------------------------------------------------------
					if ( $this.hasClass( 'eff-liquid' ) ) {

						$this.find( '.item' ).each( function( index )  {

							var $thisItem = $( this );

							
							
							//Load sprite from each slider to canvas
							//-------------------------------------
							var curSprite, 
								canvasRatio = $this.width()/realImgW;

							if ( $thisItem.find( 'video' ).length > 0 ) {
					
							
								// create a video texture from a path
								var texture = PIXI.Texture.fromVideo( $thisItem.find( 'source[type="video/mp4"]' ).attr( 'src' ) );

								curSprite = new PIXI.Sprite( texture );

								// pause the video
								var videoSource = texture.baseTexture.source;
								videoSource.autoplay = false;
								videoSource.pause();
								videoSource.currentTime = 0;
								videoSource.muted = true;

								
								var myPlayer = videojs( $thisItem.find( 'video' ).attr( 'id' ) );
								myPlayer.ready(function() {


									/* ---------  Video initialize */
									myPlayer.on( 'loadedmetadata', function() {

										//Get Video Dimensions
										var curW    = this.videoWidth(),
											curH    = this.videoHeight(),
											newW    = curW,
											newH    = curH;

										newW = $this.width();

										//Scaled/Proportional Content 
										newH = curH*(newW/curW);

										curSprite.width  = newW;
										curSprite.height = newH;	


									});		

								});



							} else {
								curSprite = new PIXI.Sprite.fromImage( $thisItem.find( 'img' ).attr( 'src' ) );
								curSprite.width  = $this.width();
								curSprite.height = $this.height();	
							}




							//Need to scale according to the screen
							curSprite.scale.set( canvasRatio );

							TweenLite.set( curSprite, {
								alpha : 0
							});	


							items_container.addChild( curSprite );
							// Enable interactions
							items_container.interactive = true;


							//Add child container to the main container 
							//-------------------------------------
							stage_filter.addChild( items_container );
							// Enable Interactions
							stage_filter.interactive = true;

							//A texture stores the information that represents an image
							displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;


							//Set the filter to stage and set some default values for the animation
							//-------------------------------------
							stage_filter.filters = [ displacementFilter ];    


							//Add filter container to the main container
							//-------------------------------------				
							displacementSprite.anchor.set( 0.5 );
							displacementSprite.x = renderer_filter.width / 2;
							displacementSprite.y = renderer_filter.height / 2; 

							displacementSprite.scale.x = 1;
							displacementSprite.scale.y = 1;

							// PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
							displacementFilter.autoFit = false;

							stage_filter.addChild( displacementSprite );

							//Animation Effects
							//-------------------------------------
							var ticker       = new PIXI.ticker.Ticker();
							ticker.autoStart = true;
							ticker.add( function( delta ) {

	//								displacementSprite.x += 12.14 * delta;
	//								displacementSprite.y += 42.24 * delta;
	//
	//								displacementSprite.scale.x += 0.2 * delta;
	//								displacementSprite.scale.y += 0.2 * delta;

								// Render updated scene
								renderer_filter.render( stage_filter );

							});






						});


					}// end effect


					

					//----------------------------------------------------------------------------------
					//--------------------------------- 3D Rotating Effect -----------------------------
					//----------------------------------------------------------------------------------
					if ( $this.hasClass( 'eff-3d-rotating' ) ) {


						init();
						animate();

						
						//Add Geometries and Lights to the main container 
						//-------------------------------------					
						function init() {
							$this.find( '.item' ).each( function( index )  {

								var $thisItem = $( this );
						
								// create a scene, that will hold all our elements such as objects, cameras and lights.
								var scene  = new THREE.Scene();
								scene.name = 'scene-' + index;


								// make a list item
								var element = document.createElement( 'div' );
								element.className = 'list-item';
								element.innerHTML = '<div class="scene" style="width:'+$this.width() +'px;height:'+$this.height() +'px;"></div>';

								// Look up the element that represents the area
								// we want to render the scene
								scene.userData.element = element.querySelector( '.scene' );
								document.getElementById( rendererOuterID ).appendChild( element );
								
								TweenLite.set( $( '#' + rendererOuterID ).find( '.list-item' ), {
										alpha: 0,
										css  : {
											display: 'none'
										}
									});	


								// Create a camera, which defines where we're looking at.
								var aspect      = $this.width() / $this.height(),
									camera      = new THREE.PerspectiveCamera( 45, aspect, 0.1, 1000 );

								camera.position.x = 0;
								camera.position.y = 12;
								camera.position.z = 2000;
								camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
								scene.userData.camera = camera;



								//Allow the camera to orbit around a target.
								var controls = new THREE.OrbitControls( scene.userData.camera, scene.userData.element );
								controls.enableDamping = true;
								controls.dampingFactor = 0.15;
								controls.screenSpacePanning = false;
								controls.minDistance = 0;
								controls.maxDistance = 30;
								controls.maxPolarAngle = Math.PI / 2;

								scene.userData.controls = controls;
								
								

								// Generate one plane geometries mesh to each scene
								var texture;
								if ( $thisItem.find( 'video' ).length > 0 ) {

									
									texture = new THREE.VideoTexture( document.getElementById( $thisItem.find( 'video' ).attr( 'id' ) ) );
									texture.minFilter = THREE.LinearFilter;
									texture.magFilter = THREE.LinearFilter;
									texture.format = THREE.RGBFormat;
									
									// pause the video
									texture.image.autoplay = false;
									texture.image.currentTime = 0;
									texture.image.muted = true;
									//if( typeof dataAuto === typeof undefined ) 

								} else {
									texture = new THREE.TextureLoader().load( $thisItem.find( 'img' ).attr( 'src' ) );
									texture.generateMipmaps = false;
									texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
									texture.minFilter = THREE.LinearFilter;
								}

								

								// Immediately use the texture for material creation
								var spriteMat            = new THREE.MeshPhongMaterial( { map: texture } ),
									imgRatio             = $this.width() / $this.height(),
									geometry             = new THREE.BoxGeometry( imgRatio*5, 5, 2 ),
									displacementSprite   = new THREE.Mesh( geometry, spriteMat );

								displacementSprite.position.set( -0.01, -0.01, 0 );
								displacementSprite.rotation.set( 0, 0, 0 );
								scene.add( displacementSprite );
								


								// Generate Ambient Light
								var ambiLight = new THREE.AmbientLight( 0x404040 );
								scene.add( ambiLight );

								// Generate Directional Light
								var light = new THREE.DirectionalLight( 0xffffff, 0.5 );
								light.position.set( 0, 30, 70 );
								scene.add( light );


								// Display multiple instances of three.js in a single page
								scenesAll.push( scene );



							});

							
							//Create a render and set the size
							webGLRenderer = new THREE.WebGLRenderer( { 
													canvas   : document.getElementById( rendererID ), //canvas
													alpha    : true, 
													antialias: true 
												} );

							webGLRenderer.setClearColor( new THREE.Color( 0x000000, 0 ) );
							webGLRenderer.setPixelRatio( window.devicePixelRatio );  
							webGLRenderer.shadowMap.enabled = true;
	
							
						}
							

						//Animation Effects
						//-------------------------------------
						function animate() {
							render();
							requestAnimationFrame( animate );
						}
						
					
						function render() {
				
							
							webGLRenderer.setClearColor( 0x000000 );
							webGLRenderer.setScissorTest( false );
							webGLRenderer.clear();

							webGLRenderer.setClearColor( 0x000000 );
							webGLRenderer.setScissorTest( true );
							
							scenesAll.forEach( function( scene, i ) {
							

								//automatic rotation
								if ( !dragDropNow ) {
									scene.children[0].rotation.y = Date.now() * 0.001;
								}
								
								
								//drag & drop
								if ( dragDropNow ) {
									scene.children[0].rotation.x = toRad( targetRotationX * 1 );
									scene.children[0].rotation.y = toRad( targetRotationY * 1 );	
								}

								// Get the element that is a place holder for where we want to draw the scene
								var element = scene.userData.element;	


								// Get its position relative to the page's viewport
								var rect = element.getBoundingClientRect();
								
								// set the viewport
								webGLRenderer.setViewport( 0, 0, rect.width, rect.height );
								webGLRenderer.setScissor( 0, 0, rect.width, rect.height );
								
								// get the camera
								var camera = scene.userData.camera;

								scene.userData.controls.update();

								
								//drag & drop
								webGLRenderer.render( scene, camera );

							} );

						}

						
						
						//Mouse drag Rotate
						//-------------------------------------
						var dragDropNow                = false,
						    targetRotationX            = 0.5,
							targetRotationOnMouseDownX = 0,
							targetRotationY            = 0.2,
							targetRotationOnMouseDownY = 0,
							mouseX                     = 0,
							mouseXOnMouseDown          = 0,
							mouseY                     = 0,
							mouseYOnMouseDown          = 0,
							windowHalfX                = $this.width() / 2,
							windowHalfY                = $this.height() / 2,
							moveMagnitude              = 0.25;

						document.addEventListener( 'mousedown', onDocumentMouseDown, false );

						function onDocumentMouseDown( event ) {

							event.preventDefault();

							document.addEventListener( 'mousemove', onDocumentMouseMove, false );
							document.addEventListener( 'mouseup', onDocumentMouseUp, false );
							document.addEventListener( 'mouseout', onDocumentMouseOut, false );

							mouseXOnMouseDown = event.offsetX - windowHalfX;
							targetRotationOnMouseDownX = targetRotationX;

							mouseYOnMouseDown = event.offsetY - windowHalfY;
							targetRotationOnMouseDownY = targetRotationY;
							
							dragDropNow = true;
						}

						function onDocumentMouseMove( event ) {

							mouseX = event.offsetX - windowHalfX;
							targetRotationX = ( mouseX - mouseXOnMouseDown ) * moveMagnitude;

							mouseY = event.offsetY - windowHalfY;
							targetRotationY = ( mouseY - mouseYOnMouseDown ) * moveMagnitude;


						}

						function onDocumentMouseUp( event ) {

							document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
							document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
							document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
							
							dragDropNow = false;
							
						}

						function onDocumentMouseOut( event ) {

							document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
							document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
							document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
							
							dragDropNow = false;
						}


						//Converts numeric degrees to radians
						function toRad( number ) {
							return number * Math.PI / 180;
						}


						//Responsive plane geometries
						//-------------------------------------
						window.addEventListener( 'resize', function () {

							var width = document.getElementById( rendererID ).clientWidth;
							var height = document.getElementById( rendererID ).clientHeight;

							if ( document.getElementById( rendererID ).width !== width || document.getElementById( rendererID ).height !== height ) {

								webGLRenderer.setSize( width, height, false );

							}
							

						}, false );
						
						

					}// end effect


		
					

					canvasInteractions( 0, $this );
					
					

				}

				img.src = realSrc;


				
			
				// Fires local videos asynchronously with slider switch.
				//-------------------------------------
				if ( !Modernizr.webgl ) advancedSliderVideoEmbedInit( $items, false );	


			
				//Autoplay Slider
				//-------------------------------------			
				if ( dataAuto && !isNaN( parseFloat( dataTiming ) ) && isFinite( dataTiming ) ) {
					
					var playTimes     = 0,
						timerEvtStop  = false;

					// change item
					setInterval( function() {
					
						if ( timerEvtStop ) return;

						setTimeout( function() {
							if ( playTimes == total ) playTimes = 0;
							if ( playTimes < 0 ) playTimes = total-1;	

							advancedSliderUpdates( playTimes, $advSlider );

							playTimes++;
							
						}, dataTiming );	
						
					}, dataTiming );
	
				}
				
				$this.on( 'mouseout', function() {
					timerEvtStop = false;
				} );



				//Pagination dots 
				//-------------------------------------	
				var _dot       = '',
					_dotActive = '';
				_dot += '<ul>';
				for ( var i = 0; i < total; i++ ) {

					_dotActive = ( i == 0 ) ? 'class="active"' : '';

					_dot += '<li><a '+_dotActive+' data-index="'+i+'" href="javascript:"></a></li>';
				}
				_dot += '</ul>';

				if ( $( dataControlsPagination ).html() == '' ) $( dataControlsPagination ).html( _dot );
				
				$( dataControlsPagination ).find( 'li a' ).on( 'click', function( e ) {
					e.preventDefault();
					
					if ( !$( this ).hasClass( 'active' ) ) {
						advancedSliderUpdates( $( this ).attr( 'data-index' ), $advSlider );

						//Pause the auto play event
						timerEvtStop = true;	
					}

	

				});
				
				//Next/Prev buttons
				//-------------------------------------		
				var _prev = $( dataControlsArrows ).find( '.prev' ),
					_next = $( dataControlsArrows ).find( '.next' );
					
				$( dataControlsArrows ).find( 'a' ).attr( 'href', 'javascript:' );
				
				$( dataControlsArrows ).find( 'a' ).removeClass( 'disabled' );
				if ( !dataLoop ) {
					_prev.addClass( 'disabled' );
				}

				
				
				_prev.on( 'click', function( e ) {
					e.preventDefault();
					
					advancedSliderUpdates( parseFloat( $items.filter( '.active' ).index() ) - 1, $advSlider );

					//Pause the auto play event
					timerEvtStop = true;

				});
				
				_next.on( 'click', function( e ) {
					e.preventDefault();
					
					advancedSliderUpdates( parseFloat( $items.filter( '.active' ).index() ) + 1, $advSlider );

					
					//Pause the auto play event
					timerEvtStop = true;
					
					
				});
				
				
				
				//Added touch method to mobile device
				//-------------------------------------	
				var startX,
					startY

				
				$this.on( 'touchstart.advancedSlider', function( event ) {
					var touches = event.originalEvent.touches;
					if ( touches && touches.length ) {
						startX = touches[0].pageX;
						startY = touches[0].pageY;
				
						
						$this.on( 'touchmove.advancedSlider', function( event ) {
							
							var touches = event.originalEvent.touches;
							if ( touches && touches.length ) {
								var deltaX = startX - touches[0].pageX,
									deltaY = startY - touches[0].pageY;

								if ( deltaX >= 50) {
									//--- swipe left
									
									
									advancedSliderUpdates( parseFloat( $items.filter( '.active' ).index() ) + 1, $advSlider );


									//Pause the auto play event
									timerEvtStop = true;
									
								}
								if ( deltaX <= -50) {
									//--- swipe right
									
									advancedSliderUpdates( parseFloat( $items.filter( '.active' ).index() ) - 1, $advSlider );
									

									//Pause the auto play event
									timerEvtStop = true;							

									
								}
								if ( deltaY >= 50) {
									//--- swipe up
									
									
								}
								if ( deltaY <= -50) {
									//--- swipe down
									
								}
								if ( Math.abs( deltaX ) >= 50 || Math.abs( deltaY ) >= 50 ) {
									$this.off( 'touchmove.advancedSlider' );
								}
							}
							
						});
					}	
				});

				
				
				

			});


		}
		
	
		/*
		 * Transition Between Slides
		 *
		 * @param  {number} elementIndex     - Index of current slider.
		 * @param  {object} slider           - Selector of the slider .
		 * @return {void}                    - The constructor.
		 */
        function advancedSliderUpdates( elementIndex, slider ) {
			
			var $items                   = slider.find( '.item' ),
				$current                 = $items.eq( elementIndex ),
			    total                    = $items.length,
				dataCountTotal           = slider.data( 'count-total' ),
				dataCountCur             = slider.data( 'count-now' ),
				dataControlsPagination   = slider.data( 'controls-pagination' ),
				dataControlsArrows       = slider.data( 'controls-arrows' ),	
				dataLoop                 = slider.data( 'loop' ),
				dataAuto                 = slider.data( 'auto' );
				
			
			if( typeof dataCountTotal === typeof undefined ) dataCountTotal = 'p.count em.count';
			if( typeof dataCountCur === typeof undefined ) dataCountCur = 'p.count em.current';
			if( typeof dataControlsPagination === typeof undefined ) dataControlsPagination = '.custom-advanced-slider-sp-pagination';
			if( typeof dataControlsArrows === typeof undefined ) dataControlsArrows = '.custom-advanced-slider-sp-arrows';
			if( typeof dataLoop === typeof undefined ) dataLoop = false;
			if( typeof dataAuto === typeof undefined ) dataAuto = false;			
		
			
			
			//Reset the slider height
			//-------------------------------------	
			var $curImg, 
				realSrc,
				curNewImgH = false,
				img        = new Image();
			
			if ( $current.find( 'img' ).length == 0 ) {
			    $curImg    = $current.find( 'video' );
				realSrc    = $curImg.attr( 'poster' );
			} else {
			    $curImg    = $current.find( 'img' );
				realSrc    = $curImg.attr( 'src' );	
			}
		
			
			img.onload = function() {

				curNewImgH = img.height*(img.width/windowWidth);
				slider.css( 'height', curNewImgH + 'px' );

			}
			
			img.src = realSrc;

			
			
			
			
			//Transition Interception
			//-------------------------------------
			if ( dataLoop ) {
				if ( elementIndex == total ) elementIndex = 0;
				if ( elementIndex < 0 ) elementIndex = total-1;	
			} else {
				$( dataControlsArrows ).find( 'a' ).removeClass( 'disabled' );
				if ( elementIndex == total - 1 ) $( dataControlsArrows ).find( '.next' ).addClass( 'disabled' );
				if ( elementIndex == 0 ) $( dataControlsArrows ).find( '.prev' ).addClass( 'disabled' );
			}

			// To determine if it is a touch screen.
			if ( Modernizr.touchevents ) {
				if ( elementIndex == total ) elementIndex = total-1;
				if ( elementIndex < 0 ) elementIndex = 0;	
			}

			$( dataControlsPagination ).find( 'li a' ).removeClass( 'leave' );
			$( dataControlsPagination ).find( 'li a.active' ).removeClass( 'active' ).addClass( 'leave' );
			$( dataControlsPagination ).find( 'li a[data-index="'+elementIndex+'"]' ).addClass( 'active' ).removeClass( 'leave' );
			
			
			$items.removeClass( 'leave' );
			slider.find( '.item.active' ).removeClass( 'active' ).addClass( 'leave' );
			$items.eq( elementIndex ).addClass( 'active' ).removeClass( 'leave' );

			
			

			//Display counter
			//-------------------------------------

			$( dataCountTotal ).text( total );
			$( dataCountCur ).text( parseFloat( elementIndex ) + 1 );		
			

			// Fires local videos asynchronously with slider switch.
			//-------------------------------------
			if ( !Modernizr.webgl ) {
				advancedSliderVideoEmbedInit( $items, false );
				advancedSliderVideoEmbedInit( $current, true );	
			}
			
			
			//Canvas Interactions
			//-------------------------------------
			canvasInteractions( elementIndex, slider );
			

			
		}
		
	
		/*
		 * Canvas Interactions
		 * @http://pixijs.download/dev/docs/index.html
		 *
		 * @param  {number} elementIndex     - Index of current slider.
		 * @param  {object} slider           - Selector of the slider .
		 * @return {void}                    - The constructor.
		 */
        function canvasInteractions( elementIndex, slider ) {
			
			if ( Modernizr.webgl ) {
			
				var $myRenderer           = $( '#' + rendererOuterID ),
				    $current              = slider.find( '.item' ).eq( elementIndex ),
					imgSel                = $current.find( 'img' ),
				    curImgURL             = imgSel.attr( 'src' ),
					stageW                = slider.width(),
					stageH                = slider.height(),
					spTotal               = slider.find( '.item' ).length;
				
				
				//----------------------------------------------------------------------------------
				//--------------------------------- Brightness Effect -------------------------------	
				//----------------------------------------------------------------------------------
				if ( slider.hasClass( 'eff-brightness' ) ) {
				
			
					//Display wrapper of canvas (transitions between slides)
					//-------------------------------------	
					TweenLite.to( $myRenderer, animDuration/1000, {
						alpha : 0,
						onComplete    : function() {
							
							var curSp = renderer.stage.children[ elementIndex ];

							TweenLite.to( this.target, animDuration/1000, {
								alpha : 1
							});			
							
							
							//display the current item
							for ( var k = 0; k < spTotal; k++ ) {
								
								var obj = renderer.stage.children[ k ];
								TweenLite.set( obj, {
									alpha : 0
								});	
								
								//pause all videos
								if ( obj._texture.baseTexture.imageType == null ) {
									var videoSource = obj.texture.baseTexture.source;

									// play the video
									videoSource.currentTime = 0;
									videoSource.autoplay = false;
									videoSource.pause();
									videoSource.muted = true;
								}		
								
							}
							
							
							
							//play current video
							if ( curSp._texture.baseTexture.imageType == null ) {
								var videoSource = curSp.texture.baseTexture.source;
								
								// play the video
								videoSource.currentTime = 0;
								videoSource.autoplay = true;
								videoSource.play();
								videoSource.muted = false;
							}


							//display filters
							TweenLite.set( curSp, {
								pixi: {
									brightness: 5
								},
								alpha : 1
							});		
							
							TweenLite.to( curSp, animDuration/1000, {
								pixi: {
									brightness: 1
								},
								delay : animDuration/1000,
							});		
						
							
					
						}
					});		
	


				} // end effect


				
				

				//----------------------------------------------------------------------------------
				//--------------------------------- Liquid Distortion Effect -----------------------
				//----------------------------------------------------------------------------------
				if ( slider.hasClass( 'eff-liquid' ) ) {
					
				
					
					//Display wrapper of canvas (transitions between slides)
					//-------------------------------------	
					TweenLite.to( $myRenderer, animDuration/1000, {
						alpha : 0,
						onComplete    : function() {
							
							var curSp = items_container.children[ elementIndex ];
				
							TweenLite.to( this.target, animDuration/1000, {
								alpha : 1
							});	

							
							//display the current item
							for ( var k = 0; k < spTotal; k++ ) {
								
								var obj = items_container.children[ k ];
								TweenLite.set( obj, {
									alpha : 0
								});	
								
								//pause all videos
								if ( obj._texture.baseTexture.imageType == null ) {
									var videoSource = obj.texture.baseTexture.source;

									// play the video
									videoSource.currentTime = 0;
									videoSource.autoplay = false;
									videoSource.pause();
									videoSource.muted = true;
								}		
								
							}
							
							
							
							//play current video
							if ( curSp._texture.baseTexture.imageType == null ) {
								var videoSource = curSp.texture.baseTexture.source;
								
								// play the video
								videoSource.currentTime = 0;
								videoSource.autoplay = true;
								videoSource.play();
								videoSource.muted = false;
							}
							
                           
							//display filters
							TweenLite.set( curSp, {
								alpha : 1
							});	
							
							displacementSprite.scale.set( 10, 10 );
							var baseTimeline = TweenLite.to( displacementSprite.scale, 2, { 
								x: 0,
								y: 0,
								onComplete: function() {
									
									
								},
								onUpdate: function() {
									//console.log( baseTimeline.progress() );
									
								}
							} );
							

							
							
					
						}
					});		
					
					
					
					//Add new ripple each time mouse is clicked
					//-------------------------------------
					// @https://pixijs.download/v4.5.4/docs/PIXI.interaction.InteractionManager.html
					var rafID, mouseX, mouseY;
					
					stage_filter.pointerup = function( mouseData ) {
						TweenLite.to( displacementSprite.scale, 1, { x: 0, y: 0 } );
					    cancelAnimationFrame( rafID );               
					
					};
    
					stage_filter.pointerdown = function( mouseData ) {
						mouseX = mouseData.data.global.x;
						mouseY = mouseData.data.global.y;   
						TweenLite.to( displacementSprite.scale, 1, { x: "+=" + Math.sin( mouseX ) * 100 + "", y: "+=" + Math.cos( mouseY ) * 100 + ""  });   
						rotateSpite();	
						
					};     

					function rotateSpite() {
						displacementSprite.rotation += 0.001;
						rafID = requestAnimationFrame( rotateSpite );
					}
					
					
				

				} // end effect
				
				

				
				//----------------------------------------------------------------------------------
				//--------------------------------- 3D Rotating Effect -----------------------------
				//----------------------------------------------------------------------------------
				if ( slider.hasClass( 'eff-3d-rotating' ) ) {
					
					//Display wrapper of canvas (transitions between slides)
					//-------------------------------------	
					TweenLite.to( $myRenderer, animDuration/1000, {
						alpha : 0,
						onComplete    : function() {
							
							var curSp = $myRenderer.find( '.list-item' ).eq( elementIndex );
							
							TweenLite.to( this.target, animDuration/1000, {
								alpha : 1
							});
							
							
							//display the current item
							TweenLite.set( $myRenderer.find( '.list-item' ), {
								alpha: 0,
								css  : {
									display: 'none'
								}
							});	

							//console.log( $myRenderer.find( '.list-item' ) );
							
							console.log( scenesAll[ elementIndex ] );
							
							//display filters
							TweenLite.to( curSp, animDuration/1000, {
								alpha: 1,
								css : {
									display: 'block'
								}
							});	
							
							
						}
					});			
					
					

				}// end effect
					
				
				
				
			} else {
				slider.find( '.item canvas' ).hide();
			}
	
			
		}



    };

	
    theme.advancedSlider_SpecialEffects = {
        documentReady : documentReady        
    };

    theme.components.documentReady.push( documentReady );
    return theme;

}( theme, jQuery, window, document ) );
