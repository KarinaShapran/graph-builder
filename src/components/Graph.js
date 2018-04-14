import React, { Component } from 'react';

import vis from 'vis/dist/vis';
import 'vis/dist/vis.css';

// var nodes = new vis.DataSet([
//     {id: 1, label: 'Node 1'},
//     {id: 2, label: 'Node 2'},
//     {id: 3, label: 'Node 3'},
//     {id: 4, label: 'Node 4'},
//     {id: 5, label: 'Node 5'}
// ]);
// const container = document.getElementById('mynetwork');
// const edges = new vis.DataSet([
//     {from: 1, to: 3},
//     {from: 1, to: 2},
//     {from: 2, to: 4},
//     {from: 2, to: 5}
// ]);

export default class Graph extends Component {
    constructor() {
        super();

        this.state = {
            counter: 0
        };
    }

    componentDidMount() {
        this.drawGraph();
    }

    componentWillReceiveProps(nextProps) {
        //this.drawGraph();
        // const { nodes } = nextProps;
        // const nodesData = new vis.DataSet(nodes);
        //
        // const data = {
        //     nodes: nodesData,
        //     edges: edges
        // };
        //
        // const network = new vis.Network(container, data, options);
    }

    static clearPopUp() {
        document.getElementById('saveButton').onclick = null;
        document.getElementById('cancelButton').onclick = null;
        document.getElementById('network-popUp').style.display = 'none';
    }
    cancelEdit(callback) {
        this.clearPopUp();
        callback(null);
    }
    saveData(data,callback) {
        data.id = document.getElementById('node-id').value;
        data.label = document.getElementById('node-label').value;
        this.clearPopUp();
        callback(data);
    }

    drawGraph() {
        const container = document.getElementById('mynetwork');
        const options = {
            locale: 'ru',
            manipulation: {
                addNode:
                  function (data, callback) {
                      // filling in the popup DOM elements
                      document.getElementById('operation').innerHTML = "Add Node";
                      document.getElementById('node-id').value = data.id;
                      document.getElementById('node-label').value = data.label;
                      document.getElementById('saveButton').onclick = () => this.saveData(data, callback);
                      //document.getElementById('cancelButton').onclick = this.clearPopUp.bind();
                      document.getElementById('network-popUp').style.display = 'block';
                },
                addEdge:
                  function (edgeData, callback) {
                      if (edgeData.from === edgeData.to) {
                          var r = console.log("Do you want to connect the node to itself?");
                          if (r === true) {
                              callback(edgeData);
                          }
                      }
                      else {
                          callback(edgeData);
                      }
                  },
                editNode:
                  function (nodeData, callback) {
                      callback(nodeData);
                  },
                editEdge: function (edgeData, callback) {
                    callback(edgeData);
                },
                deleteNode: true,
                deleteEdge: true
            },
            autoResize: true,
            height: '100%',
            width: '100%',
            edges:{
                arrows: {
                    to:     {enabled: true, scaleFactor:1, type:'arrow'},
                    from:   {enabled: false, scaleFactor:1, type:'arrow'}
                },
                color: 'red'
            }
        };
        var nodes = [
            {id: 1, label: 'Node 1'},
            {id: 2, label: 'Node 2'},
            {id: 3, label: 'Node 3'},
            {id: 4, label: 'Node 4'},
            {id: 5, label: 'Node 5'}
        ];
        const edges = new vis.DataSet([
            {from: 1, to: 3},
            {from: 1, to: 2},
            {from: 2, to: 4},
            {from: 2, to: 5}
        ]);
        const data = {
            nodes: nodes,
            edges: edges
        };
        const network = new vis.Network(container, data, options);
    }

    render() {
        const { nodes } = this.props;
        console.log("Props: ", nodes);
        return (
          <div className="workspace-wrapper">
              <div id="network-popUp">
                  <span id="operation">node</span> <br />
                  <table><tr>
                      <td>id</td><td><input id="node-id" value="new value" /></td>
                  </tr>
                      <tr>
                          <td>label</td><td><input id="node-label" value="new value" /></td>
                      </tr></table>
                  <input type="button" value="save" id="saveButton" />
                  <input type="button" value="cancel" id="cancelButton" />
              </div>

              <div id="mynetwork"></div>

              {/*{*/}
                  {/*nodes ? (*/}
                    {/*nodes.map(node => {*/}
                        {/*return (*/}
                          {/*<span>{node.id}</span>*/}
                        {/*)*/}
                    {/*})*/}
                  {/*) : null*/}
              {/*}*/}
          </div>
        );
    }
}