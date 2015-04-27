// Copyright 2002-2015, University of Colorado Boulder
/**
 * Enum type pattern for the laser color, which may be white or a specific wavelength.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var VisibleColor = require( 'SCENERY_PHET/VisibleColor' );

  var OneColor = function( wavelength ) {
    this.wavelength = wavelength;
  };

  inherit( Object, OneColor, {
    getColor: function() {
      return VisibleColor.wavelengthToColor( this.wavelength * 1E9 );
    },
    getWavelength: function() {
      return this.wavelength;
    }
  } );
  return {
    OneColor: OneColor
  };
} );