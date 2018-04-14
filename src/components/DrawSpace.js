import React, { Component } from 'react';

import vis from 'vis/dist/vis';
import 'vis/dist/vis.css';

// const edges = new vis.DataSet([
//     {from: 1, to: 3},
//     {from: 1, to: 2},
//     {from: 2, to: 4},
//     {from: 2, to: 5}
// ]);
const data = new vis.DataSet();

export default class DrawSpace extends Component {
    constructor() {
        super();

        this.state = {
            id: 0,
            label: "",
            nodes: [],
            isActiveNodeUpdateModal: false,
            nodeForUpdate: {
                id: "",
                label: ""
            }
        };

        this.drawGraph = this.drawGraph.bind(this);
        this.renderUpdateNodeForm = this.renderUpdateNodeForm.bind(this);
        this.onCloseModal = this.onCloseModal.bind(this);
    }

    componentDidMount() {
        this.drawGraph(this.props.nodes);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.nodes !== this.props.nodes) {
            this.drawGraph(this.props.nodes);
        }
    }

    drawGraph(nodes) {
        const self = this;

        const options = {
            locale: 'ru',
            autoResize: false,
            height: '100%',
            width: '100%',
            edges:{
                arrows: {
                    to:     {enabled: true, scaleFactor:1, type:'arrow'},
                    from:   {enabled: false, scaleFactor:1, type:'arrow'}
                },
                color: 'red'
            },
            manipulation: {
                addNode: false,
                editNode: function (data, callback) {
                    self.renderUpdateNodeForm(data, () =>
                      document.getElementById('save-btn').onclick = () => {
                        self._saveData(data, callback);
                        self.props.updateNode(data, self.onCloseModal);
                        }
                    );
                  },
                addEdge:
                  function (edgeData, callback) {
                      if (edgeData.from === edgeData.to) {
                          let r = window.confirm("Do you want to connect the node to itself?");
                          if (r === true) {
                              callback(edgeData);
                          }
                      }
                      else {
                          callback(edgeData);
                      }
                  },
                editEdge: function (edgeData, callback) {
                    callback(edgeData);
                },
                deleteNode: function (data, callback) {
                    self.props.deleteNode(data.nodes[0]);
                    callback(data);
                },
                deleteEdge: true
            },
        };

        // const edges = new vis.DataSet([
        //     {from: 1, to: 3},
        //     {from: 1, to: 2},
        //     {from: 2, to: 4},
        //     {from: 2, to: 5}
        // ]);
        const data = {
            nodes: nodes
        };
        const container = document.getElementById('mynetwork');
        const network = new vis.Network(container, data, options);
        console.log("rerender", data);
        this.props.updateNodes(network.body.data.nodes._data);
    }

    onCloseModal() {
        this.setState({
            isActiveNodeUpdateModal: !this.state.isActiveNodeUpdateModal
        });
        this.inputUpdate.value = "";
    }

    _saveData(data, callback) {
        data.label = this.inputUpdate.value;
        callback(data);
    }

    renderUpdateNodeForm(node, callback) {
        this.setState({
            isActiveNodeUpdateModal: !this.state.isActiveNodeUpdateModal,
            nodeForUpdate: {
                id: node.id,
                label: node.label
            }
        }, () => callback());
    }

    render() {
        return (
          <div className="workspace-wrapper">
              {
                this.state.isActiveNodeUpdateModal
                  ? <div className="form-control update-form">
                      <span className="form-title">Update Node {this.state.nodeForUpdate.id}</span>

                      <div className="row">
                          <input
                            id="label"
                            className="input"
                            ref={ref => this.inputUpdate = ref}
                            placeholder="Type weight"
                          />
                          <button
                            id="save-btn"
                            className="btn purple"
                            type="submit"
                          >
                              Update Node
                          </button>
                      </div>
                    </div>
                  : null
              }

              <div id="mynetwork"></div>
          </div>
        );
    }
}