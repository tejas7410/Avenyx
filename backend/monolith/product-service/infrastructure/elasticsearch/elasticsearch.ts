import { Client } from '@elastic/elasticsearch';

// -> Initialize the Elasticsearch client
const elasticsearchClient = new Client({
  node: 'http://localhost:9200', 
  auth: {
    username: 'elastic', // -> Default username for the Bitnami Elasticsearch image
    password: 'elastictestnewmindai',
  },
});

// -> Export the client
export default elasticsearchClient;
