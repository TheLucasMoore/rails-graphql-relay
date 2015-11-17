import Relay from 'react-relay';

export default class extends Relay.Mutation  {

    getMutation() {
        return Relay.QL`mutation{CreateItem}`;
    }

    getFatQuery() {
        return Relay.QL`
          fragment on CreateItemPayload {
            itemEdge,
            list {
                items
            }
        }
        `;
    }

    getConfigs() {
        return [
            {
                type: 'FIELDS_CHANGE',
                fieldIDs: {
                    list: this.props.list.id
                }
            },
            {
                type: 'RANGE_ADD',
                parentName: 'list',
                parentID: this.props.list.id,
                connectionName: 'items',
                edgeName: 'itemEdge',
                rangeBehaviors: {
                    '': 'append',
                    'order(-id)': 'prepend'
                }
            }
        ];
    }

    getVariables() {
        return {
            list_id: this.props.list.id,
            name: this.props.name
        };
    }

    getOptimisticResponse() {
        const {list, name} = this.props;

        return {
            list: {
                id: list.id
            },
            itemEdge: {
                node: {
                    name: name
                }
            }
        };
    }
}
