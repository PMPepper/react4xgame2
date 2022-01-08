import React from 'react';
import ReactDOM from 'react-dom';
import {I18nProvider} from '@lingui/react';
import {Provider} from 'react-redux';

import './dom/track-focus';
import polyfills from './polyfills';
import 'css/core.scss';

//App specific
//import root from '@/redux/root';
import Game from 'components/game/Game';


//Game engine
import * as GameEngine from 'game/Game';
import Client from 'game/Client';
import LocalConnector from 'game/LocalConnector';

import baseGameDefinition from 'game/data/baseGameDefinition';//TEMP CODE

import store from 'redux/index';

//vars


// var store;

// if(process.env.NODE_ENV !== 'production') {
//   store = createStore(root, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

//   window.store = store;
// } else {
//   store = createStore(root)
// }

//REAL TEMP CODE!


//TODO list:
//-finish datatables
//-add tooltips
//-add forms support


polyfills.then(() => {
  console.log('[MAIN] post polyfills');
  //TEMP CODE
  const gameServer = GameEngine.startGame(baseGameDefinition, new Client('local', store, new LocalConnector())).then((client) => {
      console.log('[MAIN] render');

      ReactDOM.render(
        <Provider store={store}>
          {/*<I18nProvider language="en-GB">*/}
            <Game client={client} />
          {/*</Provider></I18nProvider>*/}
        </Provider>,
        document.getElementById('app')
      );
    });
  })
  /*.catch(error => {
    //TODO better error handling for failed polyfills loading
    console.error('Failed fetching polyfills ', error);
  });*/

if(process.env.NODE_ENV !== 'production') {
  //module.hot.accept();
}
