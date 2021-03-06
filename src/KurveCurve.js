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

Kurve.Curve = function(player, game, field, config, superpower) {

    var justStarted = false;
    var isInvisible = false;
    var positionY = null;
    var positionX = null;
    var nextPositionY = null;
    var nextPositionX = null;
    var previousMiddlePointY = null;
    var previousMiddlePointX = null;
    var previousMiddlePositionY = null;
    var previousMiddlePositionX = null;

    var options = {
        stepLength: config.stepLength,
        lineWidth: config.lineWidth,
        angle: 0,
        dAngle: config.dAngle,
        holeInterval: config.holeInterval,
        holeCountDown: config.holeInterval,
        selfCollisionTimeout: config.selfCollisionTimeout
    };


    this.setRandomPosition = function(newPositionX, newPositionY) {
        positionX = nextPositionX = previousMiddlePositionX = previousMiddlePointX = newPositionX;
        positionY = nextPositionY = previousMiddlePositionY = previousMiddlePointY = newPositionY;
    };
    
    this.incrementAngle = function() { options.angle += options.dAngle };
    this.decrementAngle = function() { options.angle -= options.dAngle };
    
    this.setPositionY = function(newPosition) { positionY = newPosition; };
    this.setPositionX = function(newPosition) { positionX = newPosition; };
    this.setNextPositionY = function(newPosition) { nextPositionY = newPosition; };
    this.setNextPositionX = function(newPosition) { nextPositionX = newPosition; };
    this.setAngle = function(newAngle) { options.angle = newAngle; };
    this.setJustStarted = function(newJustStarted) { justStarted = newJustStarted; };
    this.setIsInvisible = function(newIsInvisible) { isInvisible = newIsInvisible; };
    this.setPreviousMiddlePointY = function(newPreviousMiddlePoint) { previousMiddlePointY = newPreviousMiddlePoint; };
    this.setPreviousMiddlePointX = function(newPreviousMiddlePoint) { previousMiddlePointX = newPreviousMiddlePoint; };
    this.setPreviousMiddlePositionY = function(newPreviousMiddlePosition) { previousMiddlePositionY = newPreviousMiddlePosition; };
    this.setPreviousMiddlePositionX = function(newPreviousMiddlePosition) { previousMiddlePositionX = newPreviousMiddlePosition; };

    this.hasJustStarted = function() { return justStarted; };
    this.getPlayer = function() { return player; };
    this.getGame = function() { return game; };
    this.getField = function() { return field; };
    this.getSuperpower = function() { return superpower };
    this.getPositionY = function() { return positionY; };
    this.getPositionX = function() { return positionX; };
    this.getNextPositionY = function() { return nextPositionY; };
    this.getNextPositionX = function() { return nextPositionX; };
    this.getOptions = function() { return options; };
    this.isInvisible = function() { return isInvisible; };
    this.getPreviousMiddlePointY = function() { return previousMiddlePointY; };
    this.getPreviousMiddlePointX = function() { return previousMiddlePointX; };
    this.getPreviousMiddlePositionY = function() { return previousMiddlePositionY; };
    this.getPreviousMiddlePositionX = function() { return previousMiddlePositionX; };

};

Kurve.Curve.prototype.drawNextFrame = function() {
    this.moveToNextFrame();
    this.checkForCollision();
    this.drawLine(this.getField());
    
    if ( this.useSuperpower(Kurve.Superpowerconfig.hooks.DRAW_NEXT_FRAME) ) {
        this.getPlayer().getSuperpower().act(Kurve.Superpowerconfig.hooks.DRAW_NEXT_FRAME, this);
    }

    if ( Kurve.Config.Debug.curvePosition ) {
        this.getField().ctx.fillStyle = '#000';
        this.getField().ctx.fillRect(u.round(this.getPositionX(), 0), u.round(this.getPositionY(), 0), 1, 1);
    }
};

Kurve.Curve.prototype.drawCurrentPosition = function(field) {
    field.drawUntrackedPoint(this.getPositionX(), this.getPositionY(), this.getPlayer().getColor());
};

Kurve.Curve.prototype.drawLine = function(field) {
    this.setIsInvisible(this.getOptions().holeCountDown < 0);

    if ( this.useSuperpower(Kurve.Superpowerconfig.hooks.DRAW_LINE) ) {
        this.getPlayer().getSuperpower().act(Kurve.Superpowerconfig.hooks.DRAW_LINE, this);
    }

    if ( this.isInvisible() ) {
        if ( this.getOptions().holeCountDown < -2 ) this.resetHoleCountDown();
    } else {
        field.drawLine(this.getPreviousMiddlePositionX(), this.getPreviousMiddlePositionY(), this.getNextPositionX(), this.getNextPositionY(), this.getPlayer().getColor());
    }

    this.getOptions().holeCountDown--;
};

Kurve.Curve.prototype.moveToNextFrame = function() {
    this.computeNewAngle();
    
    var middlePointY = this.getMovedPositionY(this.getOptions().stepLength / 2);
    var middlePointX = this.getMovedPositionX(this.getOptions().stepLength / 2);
    var nextPointY   = this.getMovedPositionY(this.getOptions().stepLength);
    var nextPointX   = this.getMovedPositionX(this.getOptions().stepLength);

    if ( this.getPreviousMiddlePointY() === null || this.getPreviousMiddlePointX() === null ) {
        this.setPreviousMiddlePointY(middlePointY);
        this.setPreviousMiddlePointX(middlePointX);
    }

    this.setPreviousMiddlePositionY(this.getPreviousMiddlePointY());
    this.setPreviousMiddlePositionX(this.getPreviousMiddlePointX());
    this.setPositionY(this.getNextPositionY());
    this.setPositionX(this.getNextPositionX());
    this.setNextPositionY(nextPointY);
    this.setNextPositionX(nextPointX);
    this.setPreviousMiddlePointY(middlePointY);
    this.setPreviousMiddlePointX(middlePointX);
};

Kurve.Curve.prototype.getMovedPositionX = function(step) {
    return this.getNextPositionX() + step * Math.cos(this.getOptions().angle);
};

Kurve.Curve.prototype.getMovedPositionY = function(step) {
    return this.getNextPositionY() + step * Math.sin(this.getOptions().angle);
};

Kurve.Curve.prototype.checkForCollision = function() {
    if ( this.useSuperpower(Kurve.Superpowerconfig.hooks.IS_COLLIDED) ) {
        var superpowerIsCollided = this.getPlayer().getSuperpower().act(Kurve.Superpowerconfig.hooks.IS_COLLIDED, this);

        //use === to make sure it is not null, null leads to default collision detection
        if ( superpowerIsCollided === true ) return this.die();
        if ( superpowerIsCollided === false ) return;
    } else if ( this.hasJustStarted() ) {
        this.setJustStarted(false);
        return;
    }

    var trace = u.interpolateTwoPoints(this.getPositionX(), this.getPositionY(), this.getNextPositionX(), this.getNextPositionY());
    var isCollided = false;
    var that = this;

    for (var pointX in trace) {
        for (var pointY in trace[pointX]) {
            if ( this.isCollided(pointX, pointY) ) isCollided = true;

            if ( Kurve.Config.Debug.curveTrace ) {
                that.getField().ctx.globalAlpha = 0.5;
                that.getField().ctx.fillStyle = '#000';
                that.getField().ctx.fillRect(pointX, pointY, 1, 1);
            }
        }
    }

    if ( isCollided ) this.die();
};

Kurve.Curve.prototype.isCollided = function(positionX, positionY) {
    if ( this.getField().isPointOutOfBounds(positionX, positionY) ) return true;
    if ( !this.getField().isPointDrawn(positionX, positionY) ) return false;
    if ( !this.getField().isPointDrawnInColor(positionX, positionY, this.getPlayer().getColor()) ) return true;

    return !this.isPointInImmediateTrace(positionX, positionY);
};

Kurve.Curve.prototype.isPointInImmediateTrace = function(positionX, positionY) {
    var now = new Date();
    var point = this.getField().getDrawnPoint(positionX, positionY);

    if ( now.getTime() - point.time.getTime() < this.getOptions().selfCollisionTimeout ) return true;

    return false;
};

Kurve.Curve.prototype.die = function() {
    this.getGame().notifyDeath(this);
};

Kurve.Curve.prototype.computeNewAngle = function() {
    if ( this.getGame().isKeyDown(this.getPlayer().getKeyRight()) ) {
        this.incrementAngle();
    } else if ( this.getGame().isKeyDown(this.getPlayer().getKeyLeft()) ) {
        this.decrementAngle();
    }
};
    
Kurve.Curve.prototype.setRandomAngle = function() {
    this.setAngle(2 * Math.PI * Math.random());
};

Kurve.Curve.prototype.useSuperpower = function(hook) {
    if ( !this.getPlayer().getSuperpower().usesHook(hook) ) return false;
    if ( this.getPlayer().getSuperpower().isActive() ) return true;
    if ( Kurve.Game.isKeyDown(this.getPlayer().getKeySuperpower()) && this.getPlayer().getSuperpower().getCount() > 0 ) return true;

    return false;
};

Kurve.Curve.prototype.resetHoleCountDown = function() {
    this.getOptions().holeCountDown = this.getOptions().holeInterval;
};
