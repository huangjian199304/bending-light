// Copyright 2002-2015, University of Colorado Boulder

/**
 * A Wave particle layer rendered on canvas
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );

  /**
   * @param {ObservableArray<WaveParticle>} waveParticles - model of wave particles contains position, color etc
   * @param {ModelViewTransform2} modelViewTransform - Transform between model and view coordinate frames
   * @param {Object} [options] - options that can be passed on to the underlying node
   * @constructor
   */
  function WaveCanvasNode( introView, modelViewTransform, options ) {
    this.introView = introView;
    this.modelViewTransform = modelViewTransform; // @public
    CanvasNode.call( this, options );
    this.invalidatePaint();
  }

  return inherit( CanvasNode, WaveCanvasNode, {

    /**
     * Paints the particles on the canvas node.
     * @protected
     * @param {CanvasContextWrapper} wrapper
     */
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;

      var model = this.introView.bendingLightModel;

      // Render the incident ray last so that it will overlap the reflected ray completely
      var order = [ 2, 1, 0 ];
      for ( var k = 0; k < model.rays.length; k++ ) {
        var ray = model.rays.get( order[ k ] );
        context.save();

        context.beginPath();
        ray.waveShapeCommand( context, this.modelViewTransform );
        context.clip();

        for ( var i = 0; i < ray.particles.length; i++ ) {
          var particle = ray.particles.get( i );
          var particleWidth = this.modelViewTransform.modelToViewDeltaX( particle.width );
          var x = this.modelViewTransform.modelToViewX( particle.getX() );
          var y = this.modelViewTransform.modelToViewY( particle.getY() );
          var angle = particle.angle;
          var point1X = x + (particleWidth * Math.sin( angle ) / 2);
          var point1Y = y + (particleWidth * Math.cos( angle ) / 2);
          var point2X = x - (particleWidth * Math.sin( angle ) / 2);
          var point2Y = y - (particleWidth * Math.cos( angle ) / 2);

          // wave particle height
          var lineWidth = this.modelViewTransform.modelToViewDeltaX( particle.height );
          if ( this.canvasBounds.containsCoordinates( point1X, point1Y ) ||
               this.canvasBounds.containsCoordinates( point1X, point1Y ) ||
               this.canvasBounds.containsCoordinates( point1X - lineWidth * Math.cos( angle ), point1Y + lineWidth * Math.sin( angle ) ) ||
               this.canvasBounds.containsCoordinates( point2X - lineWidth * Math.cos( angle ), point2Y + lineWidth * Math.sin( angle ) ) ) {

            // apply gradient to wave particle
            var gradient = context.createLinearGradient( x, y, x - lineWidth * Math.cos( angle ), y + lineWidth * Math.sin( angle ) );
            gradient.addColorStop( 0, particle.color );
            gradient.addColorStop( 0.5, particle.particleGradientColor );
            gradient.addColorStop( 1, particle.color );

            // draw wave particle
            context.beginPath();
            context.moveTo( point2X, point2Y );
            context.lineTo( point1X, point1Y );
            context.lineTo( point1X - lineWidth * Math.cos( angle ), point1Y + lineWidth * Math.sin( angle ) );
            context.lineTo( point2X - lineWidth * Math.cos( angle ), point2Y + lineWidth * Math.sin( angle ) );
            context.closePath();
            context.fillStyle = gradient;
            context.fill();
          }
        }
        context.restore();
      }
    },

    /**
     * @public
     */
    step: function() {
      this.invalidatePaint();
    }

  } );
} );