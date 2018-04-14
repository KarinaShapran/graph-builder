import React, { Component } from 'react';
import Node from './Node';

import vis from 'vis/dist/vis';
import 'vis/dist/vis.css';

export default class Manipulation extends Component {
    constructor() {
        super();

        this.state = {
            id: null,
            weight: null,
            node: {},
            nodes: []
        };

        this.handleChangeId = this.handleChangeId.bind(this);
        this.handleChangeWeight = this.handleChangeWeight.bind(this);
        this.handleCreateNode = this.handleCreateNode.bind(this);
        this.resetInputs = this.resetInputs.bind(this);
    }

    handleChangeId(e) {
        this.setState({
            id: e.target.value
        });
    }

    handleChangeWeight(e) {
        this.setState({
            weight: e.target.value
        });
    }

    handleCreateNode() {
        this.setState({
            nodes: [...this.state.nodes, {
                id: this.state.id,
                label: this.state.weight
            }]
        }, () => {
            console.log(this.state.nodes);
            this.resetInputs()
        });
    }

    resetInputs() {
        this.setState({
            id: null,
            weight: null
        });
        this.inputId.value = "";
        this.inputWeight.value = "";
    }

    render() {
        return (
          <span>
            <div className="form-control">
                <label htmlFor="node-id">Node Id</label>
                <input
                  ref={ref => this.inputId = ref}
                  id="node-id"
                  onChange={(e) => this.handleChangeId(e)}
                />

                <label htmlFor="node-weigth">Node Weight</label>
                <input
                  ref={ref => this.inputWeight = ref}
                  id="node-weigth"
                  onChange={(e) => this.handleChangeWeight(e)}
                />
                <button type="submit" onClick={this.handleCreateNode}>Create Node</button>
            </div>
          </span>
        );
    }
}