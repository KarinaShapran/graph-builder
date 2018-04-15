import React, {Component} from 'react';
import DrawSpace from "./components/DrawSpace";

import './index.css';

class App extends Component {
    constructor() {
        super();

        this.state = {
            id: 0,
            weight: null,
            nodes: []
        };

        this.handleChangeWeight = this.handleChangeWeight.bind(this);
        this.handleCreateNode = this.handleCreateNode.bind(this);
        this.resetInputs = this.resetInputs.bind(this);
        // this.updateNodes = this.updateNodes.bind(this);

        this.updateNode = this.updateNode.bind(this);
        this.deleteNode = this.deleteNode.bind(this);
    }

    handleChangeWeight(e) {
        this.setState({
            weight: e.target.value
        });
    }

    handleCreateNode() {
        this.setState({
            nodes: [...this.state.nodes, {
                id: this.state.id++,
                label: this.state.weight
            }]
        }, () => {
            // console.log("App", this.state.nodes);
            this.resetInputs()
        });
    }

    resetInputs() {
        this.setState({weight: null});
        this.inputNodeWeight.value = "";
    }

    updateNode(node, callback) {
        let updatedNode = {
            id: node.id,
            label: node.label
        };

        const nodes = this.state.nodes.filter((n) => n.id !== node.id);

        const updatedNodes = [...nodes, updatedNode].sort((a, b) => {
            const aId = a.id;
            const bId = b.id;

            return aId - bId
        });

        this.setState({
            nodes: updatedNodes
        }, () => callback());
    }

    // updateNodes(data) {
    //     const nodes = Object.keys(data).map((key) => {
    //         console.log("Update node", data[key]);
    //         return data[key]
    //     });
    // }

    deleteNode(nodes) {
        const nodeId = nodes[0];
        const updatedNodes = this.state.nodes.filter((node) => node.id !== nodeId);

        this.setState({
            nodes: updatedNodes
        });
    }

    render() {
        return (
          <div className="App">
              <DrawSpace
                nodes={this.state.nodes}
                updateNode={this.updateNode}
                deleteNode={this.deleteNode}
                //updateNodes={this.updateNodes}
              />
              <div className="form-control add-node-form">
                  <label htmlFor="node-weigth" className="form-title">Add Node {this.state.id}</label>
                  <div className="row">
                      <input
                        className="input"
                        ref={ref => this.inputNodeWeight = ref}
                        id="node-weight"
                        placeholder="Type weight"
                        onChange={(e) => this.handleChangeWeight(e)}
                      />
                      <button
                        className="btn"
                        type="submit"
                        onClick={this.handleCreateNode}
                      >
                          Create Node
                      </button>
                  </div>
              </div>
          </div>
        );
    }
}

export default App;
