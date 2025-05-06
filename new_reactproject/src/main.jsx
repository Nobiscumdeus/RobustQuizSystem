
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './store.js'



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
        <App />
    </Provider>
  
  </React.StrictMode>,
)



/* ...................... For GraphQl............................ 



import './index.css'

import ReactDOM from 'react-dom/client';


import {ApolloProvider,ApolloClient, InMemoryCache} from '@apollo/client';
import AniListApp from './graphql/AnilistGraphQLApp';

const client = new ApolloClient({
  uri: 'https://graphql.anilist.co',
  cache: new InMemoryCache(),
});


ReactDOM.createRoot(document.getElementById('root')).render(
  <ApolloProvider client={client}>
 <AniListApp />
</ApolloProvider>

)

*/