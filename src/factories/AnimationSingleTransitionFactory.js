import React from 'react';
import {compose} from 'recompose';

//TODO need to way to be able to 'pause' to let the content be rendered before starting animation?
//Havent needed it so far...


//Presentational
import RenderChildren from '@/components/renderChildren/RenderChildren';


//Helpers
import hasAnyRenderableChildren from '@/helpers/react/has-any-renderable-children';


//consts
const supportsAnimation = !!document.body.animate;


const HIDDEN = 0;
const SHOWING = 1;
const VISIBLE = 2;
const HIDING = 3;


//The factory
export default function makeAnimationSingleTransition({
  name = '',
  getShowAnimation,
  getHideAnimation,
  onShowAnimationComplete = null,
  onHideAnimationComplete = null,
  getPreShowAnimationValues = null,
  getPreHideAnimationValues = null,

  mapProps = null
}) {
  if(supportsAnimation) {
    return class extends React.Component {
      static displayName = name;

      static defaultProps = {
        canInterrupt: true
      };

      constructor(props) {
        super(props);

        const {appear, children} = props;
        const hasChildren = hasAnyRenderableChildren(children);

        this._waitingForRefToShow = !!appear && hasChildren;
        this._waitingForRefToHide = false;
        this._ref = null;
        this._nextChildren = null;
        this._animation = null;
        this._interrupted = null;
        this._isMounted = true;


        //initialise the state
        this.state = {
          animationState: appear || !hasChildren ? HIDDEN : VISIBLE,
          currentChildren: children,
          self: this
        }
      }

      componentWillUnmount() {
        this._isMounted = false;

        if(this._animation) {
          this._animation.cancel();
          this._animation = null;
        }

        this._ref = null;
        this._nextChildren = null;
      }

      _getRef = (ref) => {
        this._ref = ref;

        //Call getref prop (if applicable)
        this.props.getRef && this.props.getRef(ref);

        if(this._waitingForRefToShow && ref) {
          //trigger animation in
          this._doShowingAnimation(this.state.currentChildren, this._interrupted);
        }

        if(this._waitingForRefToHide && ref) {
          //trigger animation out
          this._doHidingAnimation(this._interrupted);
        }

        if(ref) {//If ref was supplied, these will have been triggered, so can be reset to false
          this._interrupted = this._waitingForRefToShow = this._waitingForRefToHide = false;
        }
      }

      _startShowingAnimation(newChildren, interrupted = false) {
        //c/onsole.log('[ANI] _startShowingAnimation: ', newChildren, interrupted);
        this._nextChildren = null;

        if(this._ref) {//If you have the ref already, just start the animation
          return this._doShowingAnimation(newChildren, interrupted);
        }

        //mark as waiting for the ref
        this._waitingForRefToShow = true;
        this._waitingForRefToHide = false;
        this._interrupted = interrupted;

        this._onChangeAnimationState(SHOWING);

        //record state & trigger re-render
        return {
          animationState: SHOWING,
          currentChildren : newChildren,
        };
      }

      _doShowingAnimation(newChildren, interrupted = false) {
        const ref = this._ref;
        //c/onsole.log('[ANI] _doShowingAnimation: ', interrupted);

        const preAnimationStyles = getPreShowAnimationValues ? getPreShowAnimationValues(ref, interrupted) : null;

        if(this._animation) {
          this._animation.cancel();
          this._animation = null;
        }

        const animation = getShowAnimation(ref, this.props, interrupted, preAnimationStyles);

        //generic
        animation.onfinish = this._showAnimationComplete;

        this._animation = animation;

        this._waitingForRefToHide = false;
        this._waitingForRefToShow = false;
        this._interrupted = false;

        this._onChangeAnimationState(SHOWING);

        //update state
        return {
          animationState: SHOWING,
          currentChildren : newChildren,
        };
      }

      _showAnimationComplete = () => {
        if(!this._isMounted) {
          return;
        }

        this._animation = null;

        //animation specific
        onShowAnimationComplete && onShowAnimationComplete(this._ref, this.props);

        this.props.onShowComplete && this.props.onShowComplete();

        if(this.props.canInterrupt && this._nextChildren === false) {
          //c/onsole.log('[ANI] _showAnimationComplete: show complete, but now has no children: ', this._nextChildren);
          this.setState(this._startHidingAnimation(false));
        } else {
          //c/onsole.log('[ANI] _showAnimationComplete: show complete, now visible');
          this._onChangeAnimationState(VISIBLE);
          this.setState({animationState: VISIBLE});
        }
      }

      _startHidingAnimation(interrupted = false) {
        //c/onsole.log('[ANI] _startHidingAnimation: ', interrupted);
        this._nextChildren = null;

        if(this._ref) {//If you have the ref already, just start the animation
          return this._doHidingAnimation(interrupted);
        }

        //mark as waiting for the ref
        this._waitingForRefToHide = true;
        this._waitingForRefToShow = false;
        this._interrupted = interrupted;

        //record state & trigger re-render
        this._onChangeAnimationState(HIDING);

        return {
          animationState: HIDING,

        };
      }

      _doHidingAnimation(interrupted) {
        const ref = this._ref;

        //c/onsole.log('[ANI] _doHidingAnimation: ', interrupted);
        const preAnimationStyles = getPreHideAnimationValues ? getPreHideAnimationValues(ref, interrupted) : null;

        if(this._animation) {
          this._animation.cancel();
          this._animation = null;
        }

        const animation = getHideAnimation(ref, this.props, interrupted, preAnimationStyles);

        //generic
        animation.onfinish = this._hideAnimationComplete;

        this._animation = animation;

        this._waitingForRefToHide = false;
        this._waitingForRefToShow = false;
        this._interrupted = false;

        this._onChangeAnimationState(HIDING);

        //update state
        return {animationState: HIDING};
      }

      _onChangeAnimationState(newState) {
        const curState = this.state.animationState;

        if(newState !== curState) {
          this.props.onChangeAnimationState && this.props.onChangeAnimationState(newState, curState);
        }
      }

      _hideAnimationComplete = () => {
        if(!this._isMounted) {
          return;
        }

        const props = this.props;

        this._animation = null;

        //animation specific
        onHideAnimationComplete && onHideAnimationComplete(this._ref, this.props);

        props.onHideComplete && props.onHideComplete();

        if(props.canInterrupt && this._nextChildren) {
          //c/onsole.log('[ANI] _hideAnimationComplete: hide complete, but now has children: ', this._nextChildren);
          this.setState(this._startShowingAnimation(this._nextChildren, false));
        } else {
          //c/onsole.log('[ANI] _hideAnimationComplete: hide complete, now hidden');
          this._onChangeAnimationState(HIDDEN);
          this.setState({animationState: HIDDEN, currentChildren: null});

        }
      }

      _getDerivedStateFromProps(newProps) {
        const {animationState} = this.state;
        const {canInterrupt, children} = newProps;
        const hasChildren = hasAnyRenderableChildren(children);

        switch(animationState) {
          case VISIBLE:
            return hasChildren ?
              {currentChildren: children}
              :
              this._startHidingAnimation(false);
          case SHOWING:
            return hasChildren ?
              {currentChildren: children}
              :
              (canInterrupt ?
                this._startHidingAnimation(true)
                :
                (this._nextChildren = false, null)
              );
          case HIDING:
            return hasChildren ?
              (canInterrupt ?
                this._startShowingAnimation(children, true)
                :
                (this._nextChildren = children, null)
              )
              :
              null;
          case HIDDEN:
            return hasChildren ? this._startShowingAnimation(children, false) : null;
        }
      }

      render() {
        const {
          getRef, appear, canInterrupt, onHideComplete, onShowComplete, onChangeAnimationState, showTransitionSettings, hideTransitionSettings,//extract props
          component: Component = 'div',
          ...props//everything else
        } = this.props;

        return this.state.animationState === HIDDEN ?
          null
          :
          <Component {...(mapProps ? mapProps(props, this.state) : props)} ref={this._getRef}>
            {this.state.currentChildren}
          </Component>
      }

      static getDerivedStateFromProps(props, state) {
        const self = state.self;

        return self._getDerivedStateFromProps(props);
      }
    }
  } else {
    return class extends React.Component {
      static displayName = name;

      lastState = HIDDEN;

      _onChangeAnimationState(newState) {
        if(newState !== this.lastState) {
          this.props.onChangeAnimationState && this.props.onChangeAnimationState(newState, this.lastState);

          this.lastState = newState;
        }
      }

      render() {
        const props = this.props;

        const {
          getRef, appear, absolute, full, canInterrupt, onHideComplete, onShowComplete, onChangeAnimationState, showTransitionSettings, hideTransitionSettings,//extract props
          children, component: Component = 'div', className = '',
          ...rest//everything else
        } = props;

        if(Component !== 'div' || className || getRef) {
          if(!hasAnyRenderableChildren(children)) {
            this._onChangeAnimationState(HIDDEN);

            return null;
          }

          this._onChangeAnimationState(VISIBLE);

          return <Component className={className} {...rest}>{children}</Component>
        }

        return children || null;
      }
    }
  }
}
