/**
 *
 * Program:     Kurve
 * Author:      Markus Mächler, marmaechler@gmail.com
 * License:     http://www.gnu.org/licenses/gpl.txt
 * Link:        http://achtungkurve.com
 *
 * Copyright © 2014, 2015 Markus Mächler
 *
 * Kurve is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kurve is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kurve.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

'use strict';

Kurve.Superpowerconfig = {};

Kurve.Superpowerconfig.types = {
    RUN_FASTER: 'RUN_FASTER',
    RUN_SLOWER: 'RUN_SLOWER',
    JUMP: 'JUMP',
    INVISIBLE: 'INVISIBLE',
    VERTICAL_BAR: 'VERTICAL_BAR',
    CROSS_WALLS: 'CROSS_WALLS',
    DARK_KNIGHT: 'DARK_KNIGHT'
};

Kurve.Superpowerconfig.hooks = {
    DRAW_NEXT_FRAME: 'DRAW_NEXT_FRAME',
    DRAW_LINE: 'DRAW_LINE',
    IS_COLLIDED: 'IS_COLLIDED'
};
 
Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.RUN_FASTER] = {
    label: 'run faster',

    hooks: [Kurve.Superpowerconfig.hooks.DRAW_NEXT_FRAME],

    helpers: {
       executionTime: 0,
       initAct: function() {
           this.decrementCount();
           this.setIsActive(true);
           this.helpers.executionTime = 4 * Kurve.Game.fps; //4s
       },
       closeAct: function() {
           this.setIsActive(false);
       }
    },

    init: function(curve) {

    },

    act: function(hook, curve) {
       if ( !this.isActive() ) this.helpers.initAct.call(this);
       if ( this.helpers.executionTime < 1 ) this.helpers.closeAct.call(this);

       curve.moveToNextFrame();
       curve.checkForCollision();
       curve.drawLine(curve.getField());

       this.helpers.executionTime--;
    },

    close: function(curve) {
        this.setIsActive(false);
    }
 };

Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.RUN_SLOWER] = {
    label: 'run slower',

    hooks: [Kurve.Superpowerconfig.hooks.DRAW_NEXT_FRAME],

    helpers: {
        initialStepLength: null,
        executionTime: 0,
        initAct: function(curve) {
            this.decrementCount();
            this.setIsActive(true);
            this.helpers.executionTime = 4 * Kurve.Game.fps; //4s
            this.helpers.initialStepLength = curve.getOptions().stepLength;

            curve.getOptions().stepLength = this.helpers.initialStepLength / 2;
        },
        closeAct: function(curve) {
            this.setIsActive(false);
            curve.getOptions().stepLength = this.helpers.initialStepLength;
        }
    },

    init: function(curve) {

    },

    act: function(hook, curve) {
        if ( !this.isActive() ) this.helpers.initAct.call(this, curve);
        if ( this.helpers.executionTime < 1 ) this.helpers.closeAct.call(this, curve);

        this.helpers.executionTime--;
    },

    close: function(curve) {
        this.setIsActive(false);
        if ( this.helpers.initialStepLength !== null ) curve.getOptions().stepLength = this.helpers.initialStepLength;
    }
};
  
Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.JUMP] = {
    label: 'jump',

    hooks: [Kurve.Superpowerconfig.hooks.DRAW_NEXT_FRAME],
     
    helpers: {
        jumpWidth: 10,
        timeOut: 250, //until superpower can be called again
        previousExecution: new Date()
    },

    init: function(curve) {

    },
     
    act: function(hook, curve) {
        var now = new Date();
         
        if ( now.getTime() - this.helpers.previousExecution.getTime() > this.helpers.timeOut ) {
            var jumpedPositionX = curve.getMovedPositionX(curve.getOptions().stepLength * this.helpers.jumpWidth);
            var jumpedPositionY = curve.getMovedPositionY(curve.getOptions().stepLength * this.helpers.jumpWidth);

            curve.setNextPositionX(jumpedPositionX);
            curve.setNextPositionY(jumpedPositionY);
            curve.setPreviousMiddlePointX(jumpedPositionX);
            curve.setPreviousMiddlePointY(jumpedPositionY);

            this.helpers.previousExecution = now;
            this.decrementCount();
        }
    },

    close: function(curve) {

    }
 };
  
Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.INVISIBLE] = {
    label: 'invisible',

    hooks: [
        Kurve.Superpowerconfig.hooks.DRAW_LINE,
        Kurve.Superpowerconfig.hooks.IS_COLLIDED
    ],

    helpers: {
        executionTime: 0,
        initAct: function() {
           this.decrementCount();
            this.setIsActive(true);
           this.helpers.executionTime = 4 * Kurve.Game.fps; //4s
        },
        closeAct: function() {
            this.setIsActive(false);
        }
    },

    init: function(curve) {

    },

    act: function(hook, curve) {
        if ( hook === Kurve.Superpowerconfig.hooks.DRAW_LINE ) {
            if ( !this.isActive() ) this.helpers.initAct.call(this);
            if ( this.helpers.executionTime < 1 ) this.helpers.closeAct.call(this);

            curve.setIsInvisible(true);

            this.helpers.executionTime--;          
        } else if ( hook === Kurve.Superpowerconfig.hooks.IS_COLLIDED && this.isActive() ) {
            return false;
        }
    },

    close: function(curve) {
        this.setIsActive(false);
    }
 };

Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.VERTICAL_BAR] = {
    label: 'vertical bar',

    hooks: [
        Kurve.Superpowerconfig.hooks.DRAW_NEXT_FRAME
    ],

    helpers: {
        timeOut: 250, //until superpower can be called again
        previousExecution: new Date(),
        barWidth: 40
    },

    init: function(curve) {

    },

    act: function(hook, curve) {
        var now = new Date();

        if ( now.getTime() - this.helpers.previousExecution.getTime() > this.helpers.timeOut ) {

            var leftEndX     = Math.cos(curve.getOptions().angle - Math.PI / 2) * this.helpers.barWidth + curve.getPositionX();
            var leftEndY     = Math.sin(curve.getOptions().angle - Math.PI / 2) * this.helpers.barWidth + curve.getPositionY();
            var rightEndX    = Math.cos(curve.getOptions().angle + Math.PI / 2) * this.helpers.barWidth + curve.getPositionX();
            var rightEndY    = Math.sin(curve.getOptions().angle + Math.PI / 2) * this.helpers.barWidth + curve.getPositionY();

            Kurve.Field.drawLine(leftEndX, leftEndY, rightEndX, rightEndY, curve.getPlayer().getColor());

            this.helpers.previousExecution = now;
            this.decrementCount();
        }
    },

    close: function(curve) {

    }
};

Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.CROSS_WALLS] = {
    label: 'cross walls',

    hooks: [
        Kurve.Superpowerconfig.hooks.IS_COLLIDED
    ],

    helpers: {
        getWallCrossedPosition: function(curve) {
            var positionX = curve.getNextPositionX();
            var positionY = curve.getNextPositionY();
            var field = curve.getField();
            var posX, posY = 0;

            if ( positionX > field.width ) {
                posX = positionX - field.width;
                posY = positionY;
            } else if ( positionX < 0 ) {
                posX = positionX + field.width;
                posY = positionY;
            } else if ( positionY > field.height ) {
                posX = positionX;
                posY = positionY - field.height;
            } else {
                //position.getPosY() < 0 or an error occured
                posX = positionX;
                posY = positionY + field.height;
            }

            return new Kurve.Point(posX, posY);
        }
    },

    init: function(curve) {
        this.setIsActive(true);
    },

    act: function(hook, curve) {
        var positionX = curve.getNextPositionX();
        var positionY = curve.getNextPositionY();

        if ( curve.getField().isPointOutOfBounds(positionX, positionY) && this.getCount() > 0 ) {
            this.decrementCount();
            var movedPosition = this.helpers.getWallCrossedPosition(curve);

            //todo refactor in a away that from outside only one call is needed to change position
            curve.setPositionX(movedPosition.getPosX());
            curve.setPositionY(movedPosition.getPosY());
            curve.setNextPositionX(movedPosition.getPosX());
            curve.setNextPositionY(movedPosition.getPosY());
            curve.setPreviousMiddlePointX(movedPosition.getPosX());
            curve.setPreviousMiddlePointY(movedPosition.getPosY());
            curve.setPreviousMiddlePositionX(movedPosition.getPosX());
            curve.setPreviousMiddlePositionY(movedPosition.getPosY());

            return false;
        }

        //use standard collision detection
        return null;
    },

    close: function(curve) {
        this.setIsActive(false);
    }
};

Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.DARK_KNIGHT] = {
    label: 'dark knight',

    hooks: [
        Kurve.Superpowerconfig.hooks.DRAW_NEXT_FRAME
    ],

    helpers: {
        executionTime: 0,
        darkNightDivId: 'dark-knight',
        initAct: function() {
            if ( !u.hasClass('hidden', this.helpers.darkNightDivId) ) return;

            u.removeClass('hidden', this.helpers.darkNightDivId);
            this.decrementCount();
            this.setIsActive(true);
            this.helpers.executionTime = 3 * Kurve.Game.fps; //3s
        },
        closeAct: function() {
            u.addClass('hidden', this.helpers.darkNightDivId);
            this.setIsActive(false);
        }
    },

    init: function(curve) {

    },

    act: function(hook, curve) {
        if ( !this.isActive() ) this.helpers.initAct.call(this);
        if ( this.helpers.executionTime < 1 ) this.helpers.closeAct.call(this);

        this.helpers.executionTime--;
    },

    close: function(curve) {
        this.setIsActive(false);

        if ( !u.hasClass('hidden', this.helpers.darkNightDivId) ) u.addClass('hidden', this.helpers.darkNightDivId);
    }
};
 