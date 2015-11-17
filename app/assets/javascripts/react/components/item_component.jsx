import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';
import classNames from 'classnames';

import DestroyItemMutation from '../mutations/destroy_item_mutation';
import EditItemMutation from '../mutations/edit_item_mutation';

import TextInput from './text_input_component';
import Button from './button_component';

export class Component extends React.Component {
    static propTypes = {
        list: React.PropTypes.object.isRequired,
        item: React.PropTypes.object.isRequired
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
          isEditing: false
        };
    }

    onDestroyClick = () => {
        this.removeItem();
    };

    onEditClick = () => {
      this.setEditMode(true);
    };

    handleSave = (name) => {
        const {item} = this.props;

        this.setEditMode(false);
        Relay.Store.update(
            new EditItemMutation({item, name})
        );
    };

    setEditMode(isEditing) {
        this.setState({isEditing});
    }

    removeItem() {
        const {list, item} = this.props;
        Relay.Store.update(
            new DestroyItemMutation({list, item})
        );
    }

    renderTextInput() {
        if (!this.state.isEditing) {
            return null
        }

        return (
            <TextInput
                className="edit"
                initialValue={this.props.item.name}
                onCancel={this.onCancelClick}
                onDelete={this.onDestroyClick}
                onSave={this.handleSave}
            />
        );
    }

    render() {
        let item = this.props;
        const {isEditing} = this.state;

        return (
           <li data-react-component="item" className={classNames({editing: isEditing})}>
               <div className="view">
                {item.name}
                   <Button className="destroy" onClick={this.onDestroyClick} />
                   <Button className="edit" onClick={this.onEditClick} />

               </div>
               {this.renderTextInput()}
           </li>
        );
    }
}



export const RelayContainer = Relay.createContainer(Component, {
    fragments: {
        item: () => Relay.QL`
            fragment on Component {
                id,
                name
            }
        `
    }
});
