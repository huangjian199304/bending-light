// Copyright 2002-2015, University of Colorado Boulder
/**
 * The protractor node is a circular device for measuring angles.
 * In this sim it is used for measuring the angle of the incident,
 * reflected and refracted light.
 *
 * @author Sam Reid
 * @author Chandrashekar Bemagoni(Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Shape = require( 'KITE/Shape' );
  var Property = require( 'AXON/Property' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );
  var ConstraintBounds = require( 'BENDING_LIGHT/common/ConstraintBounds' );

  // images
  var protractorImage = require( 'image!BENDING_LIGHT/protractor.png' );

  // constants
  var DEFAULT_SCALE = 0.4;

  /**
   *
   * @param {ModelViewTransform2} modelViewTransform transform to convert between model and view values
   * @param {Property<Boolean>} showProtractorProperty  controls the protractor visibility
   * @param {ProtractorModel} protractorModel model of protractor
   * @param {function} translateShape
   * @param {function} rotateShape
   * @param {Number} ICON_WIDTH
   * @param {Bounds2} containerBounds - bounds of container for all tools, needed to snap protractor to initial position when it in container
   * @param {Bounds2} dragBounds - bounds that define where the protractor    may be dragged
   * @constructor
   */
  function ProtractorNode( modelViewTransform, showProtractorProperty, protractorModel, translateShape, rotateShape, ICON_WIDTH, containerBounds, dragBounds ) {

    var protractorNode = this;
    Node.call( protractorNode );

    this.modelViewTransform = modelViewTransform;
    this.protractorModel = protractorModel;
    this.multiScale = ICON_WIDTH / protractorImage.width;
    // True if the protractor has been made larger
    this.expandedProperty = new Property( false );
    this.expandedButtonVisibilityProperty = new Property( false );
    //Load and add the image
    this.protractorImageNode = new Image( protractorImage, { pickable: true } );
    protractorNode.setScaleMagnitude( this.multiScale );
    showProtractorProperty.link( function( showProtractor ) {
      protractorNode.protractorImageNode.setVisible( showProtractor );
    } );
    this.addChild( this.protractorImageNode );

    var protractorImageWidth = this.protractorImageNode.getWidth();
    var protractorImageHeight = this.protractorImageNode.getHeight();

    //Shape for the outer ring of the protractor
    var outerRimShape = new Shape()
      .moveTo( protractorImageWidth, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2, protractorImageWidth / 2, protractorImageHeight / 2, 0, 0, Math.PI, true )
      .lineTo( protractorImageWidth * 0.2, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2, protractorImageWidth * 0.3, protractorImageHeight * 0.3, 0, Math.PI, 0, false )
      .lineTo( protractorImageWidth, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2, protractorImageWidth / 2, protractorImageHeight / 2, 0, 0, Math.PI, false )
      .lineTo( protractorImageWidth * 0.2, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2, protractorImageWidth * 0.3, protractorImageHeight * 0.3, 0, Math.PI, 0, true )
      .close();

    var fullShape = new Shape()
      .moveTo( protractorImageWidth, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2,
      protractorImageWidth / 2, protractorImageHeight / 2, 0, 0, Math.PI, true )
      .lineTo( protractorImageWidth * 0.2, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2,
      protractorImageWidth * 0.3, protractorImageHeight * 0.3, 0, Math.PI, 0, false )
      .lineTo( protractorImageWidth, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2,
      protractorImageWidth / 2, protractorImageHeight / 2, 0, 0, Math.PI, false )
      .lineTo( protractorImageWidth * 0.2, protractorImageHeight / 2 )
      .ellipticalArc( protractorImageWidth / 2, protractorImageHeight / 2,
      protractorImageWidth * 0.3, protractorImageHeight * 0.3, 0, Math.PI, 0, true )
      .rect( protractorImageWidth * 0.2, protractorImageHeight / 2,
      protractorImageWidth * 0.6, protractorImageHeight * 0.15 )
      .close();

    this.innerBarShape = new Shape().rect( protractorImageWidth * 0.2, protractorImageHeight / 2,
      protractorImageWidth * 0.6, protractorImageHeight * 0.15 );

    //Add a mouse listener for dragging when the drag region
    // (entire body in all tabs, just the inner bar on prism break tab) is dragged
    var translatePath = new Path( translateShape( fullShape, this.innerBarShape, outerRimShape ), {
      pickable: true,
      cursor: 'pointer'
    } );
    this.addChild( translatePath );
    var start;
    //TODO : use MovableDragHandler instead  of SimpleDragHandler
    translatePath.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = protractorNode.globalToParentPoint( event.pointer.point );
        if ( containerBounds ) {
          if ( containerBounds.intersectsBounds( protractorNode.getBounds() ) ) {
            protractorNode.setProtractorScaleAnimation( start, DEFAULT_SCALE );
          }
        }
        protractorNode.expandedButtonVisibilityProperty.value = true;
      },
      drag: function( event ) {
        //Compute the change in angle based on the new drag event
        var end = protractorNode.globalToParentPoint( event.pointer.point );
        end = ConstraintBounds.constrainLocation( end, dragBounds );
        protractorNode.dragAll( end.minus( start ) );
        start = end;
      },
      end: function() {
        if ( containerBounds ) {
          if ( containerBounds.intersectsBounds( protractorNode.getBounds() ) ) {
            var point2D = protractorNode.modelViewTransform.modelToViewPosition(
              protractorNode.protractorModel.positionProperty.initialValue );
            protractorNode.setProtractorScaleAnimation( point2D, protractorNode.multiScale );
            protractorNode.expandedButtonVisibilityProperty.value = false;
            protractorNode.expandedProperty.value = false;
          }
        }
        else {
          protractorNode.expandedButtonVisibilityProperty.value = true;
        }
      }
    } ) );
    //Add a mouse listener for rotating when the rotate shape (the outer ring in the 'prism break' tab is dragged)
    var rotatePath = new Path( rotateShape( fullShape, this.innerBarShape, outerRimShape ), {
      pickable: true,
      cursor: 'pointer'
    } );
    this.addChild( rotatePath );
    rotatePath.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        start = protractorNode.globalToParentPoint( event.pointer.point );
      },
      drag: function( event ) {
        //Compute the change in angle based on the new drag event
        var end = protractorNode.globalToParentPoint( event.pointer.point );
        var startAngle = protractorNode.center.minus( start ).angle();
        var angle = protractorNode.center.minus( end ).angle();
        //Rotate the protractor model
        protractorModel.angle = angle - startAngle;
        start = end;
      }
    } ) );

    this.protractorModel.angleProperty.link( function( angle ) {
      protractorNode.rotateAround( protractorNode.center, angle );
    } );
    this.protractorModel.positionProperty.link( function( position ) {
      var center = protractorNode.modelViewTransform.modelToViewPosition( position );
      var point = new Vector2( center.x - (protractorNode.protractorImageNode.width * protractorNode.getScaleVector().x / 2),
        center.y - (protractorNode.protractorImageNode.height * protractorNode.getScaleVector().y / 2) );
      var newPoint = point.minus( center ).rotate( protractorNode.getRotation() );
      protractorNode.setTranslation( newPoint.plus( center ) );
    } );
  }

  return inherit( Node, ProtractorNode, {

      resetAll: function() {
        this.expandedProperty.reset();
        this.expandedButtonVisibilityProperty.reset();
        this.setProtractorScale( this.multiScale );
      },

      /**
       * Resize the protractor
       *
       * @param {Number} scale
       */
      setProtractorScale: function( scale ) {
        this.setScaleMagnitude( scale );
        var point2D = this.modelViewTransform.modelToViewPosition( this.protractorModel.position );
        this.setTranslation( point2D.x - (this.width / 2), point2D.y - (this.height / 2 ) );
      },

      /**
       *
       * @param {Vector2}endPoint
       * @param {Number} scale
       */
      setProtractorScaleAnimation: function( endPoint, scale ) {
        var startPoint = { x: this.centerX, y: this.centerY, scale: this.getScaleVector().x };
        var finalPosition = { x: endPoint.x, y: endPoint.y, scale: scale };
        this.init( startPoint, finalPosition );
        this.protractorModel.positionProperty.set( this.modelViewTransform.viewToModelPosition( endPoint ) );
      },

      /**
       *
       * @param {Object} initialPosition
       * @param {Object} finalPosition
       */
      init: function( initialPosition, finalPosition ) {
        var target = this;
        new TWEEN.Tween( initialPosition )
          .to( finalPosition, 100 )
          .easing( TWEEN.Easing.Linear.None )
          .onUpdate( function() {
            target.setScaleMagnitude( initialPosition.scale );
            target.centerX = initialPosition.x;
            target.centerY = initialPosition.y;
          } ).start();
      },

      /**
       * Translate the protractor, this method is called when dragging out of the toolbox
       *
       * @param {Vector2} delta
       */
      dragAll: function( delta ) {
        this.protractorModel.translate( this.modelViewTransform.viewToModelDelta( delta ) );
      },

      /**
       * Change the visibility and pickability of this ProtractorNode
       *
       * @param {boolean} isVisible
       */
      setVisible: function( isVisible ) {
        this.setVisible( isVisible );
        this.setPickable( isVisible );
      }
    },


    // statics
    {
      DEFAULT_SCALE: DEFAULT_SCALE
    } );
} );