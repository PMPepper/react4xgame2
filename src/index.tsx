import React from 'react';
import { createRoot } from 'react-dom/client';
import {I18nProvider} from '@lingui/react';
import {Provider} from 'react-redux';

import polyfills from './polyfills';
import 'css/core.scss';

//App specific
//import root from '@/redux/root';
import Game from 'components/game/Game';

//Game engine
import * as GameEngine from 'game/Game';
import Client from 'game/Client';
import LocalConnector from 'game/LocalConnector';
import WorkerConnector from 'game/WorkerConnector';

import baseGameDefinition from 'game/data/baseGameDefinition';//TEMP CODE

import store from 'redux/reducers/index';

//import connect from './webrtc';
import doTest from './test';

//i18n
import { i18n } from "@lingui/core";
import { messages } from './locales/en/messages.js'

i18n.load('en', messages)
i18n.activate('en')


//TODO list:
//-finish datatables
//-add tooltips
//-add forms support

const useWorker = true;
const connector = useWorker ?
  new WorkerConnector()
  :
  new LocalConnector();


polyfills.then(() => {
  console.log('[MAIN] post polyfills');
  //TEMP CODE

  //connect();

  false && doTest();


  GameEngine.startGame(baseGameDefinition, new Client('local', store, connector)).then((client) => {
    console.log('[MAIN] render');

    const root = createRoot(document.getElementById('app'));

    root.render(
      <Provider store={store}>
        <I18nProvider i18n={i18n}>
          <Game client={client} />
        </I18nProvider>
      </Provider>
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
