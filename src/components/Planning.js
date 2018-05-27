import React, { Component } from 'react';
import Graph from 'graph.js';

export default class Planning extends Component {

    constructor() {
        super();
        this.state = {
            processors: [
              {id: 0, isFree: true, actionsList: [], computing: ""},
              {id: 1, isFree: true, actionsList: [], computing: ""},
              {id: 2, isFree: true, actionsList: [], computing: ""}],
            banks: 2,
            tact: 1,
            queue: [],
            mode: 1,
        };

        this.modeling = this.modeling.bind(this);
    }

    componentDidUpdate (prevProps) {

        if (!prevProps.queue.length && this.props.queue.length) {
            console.log(this.props.queue);

            const queueWithoutMaxLength = this.props.queue.map(queueNode => {
                const {maxLength, links, parents, ...rest} = queueNode;

                if (parents) {
                    return {...rest, links: parents};
                }
                return {...rest};
            });

            const queueWithWeigth = queueWithoutMaxLength.map(node => {
                const nodeWithWeight = this.props.nodes.find(n => n.id == node.id);

                return {...node, weight: nodeWithWeight.label}
            });

            this.props.sourceNodes.forEach(sourceNodeId => {
                const node = queueWithWeigth.find(node => node.id == sourceNodeId);

                node.isReadyToCompute = true;
            });

            this.setState({
                queue: queueWithWeigth
            });
        } else if (this.props.queue.length) {
            this.modeling();
        }


    }

    modeling() {
        const {processors, banks, tact, queue} = this.state;
        const {nodes, sourceNodes} = this.props;

        const updatedQueue = [...queue];
        const updatedProcessors = [...processors];

        const freeProcessors = updatedProcessors.filter(processor => processor.isFree);
        const busyProcessors = updatedProcessors.filter(processor => !processor.isFree);

        if (updatedQueue.find(node => node.isComputed === undefined)) {
            console.log('tact', tact);
            // debugger;

            // At the very begining of tact set isReadyToCompute = true for nodes that depend on recently finished nodes
            queue.forEach(node => {
               if (!node.isReadyToCompute) {
                   const nodesItDepentOn = queue.filter(queueNode => node.links.includes(queueNode.id));
                   const areAllReady = nodesItDepentOn.every(node => node.isComputed === true);

                   if (areAllReady) {
                       node.isReadyToCompute = true;
                   }
               }
            });

            // For each free processor
            freeProcessors.forEach(freeProcessor => {
                // Get first node from queue which is readyToCompute, is not started
                const nodeToCompute = updatedQueue.find(
                  queueNode => queueNode.isReadyToCompute && queueNode.started === undefined
                );

                // If there is node that can be started to be completed in this tact
                if (nodeToCompute) {
                    // Set the number of started tact
                    nodeToCompute.started = tact;
                    freeProcessor.isFree = false;
                    freeProcessor.computing = nodeToCompute.id;
                    freeProcessor.actionsList.push(nodeToCompute.id)
                } else {
                    freeProcessor.actionsList.push('nothing');
                }
            });

            busyProcessors.forEach(busyProcessor => {
                busyProcessor.actionsList.push(busyProcessor.computing);
            });

            const startedNotFinished = updatedQueue.filter(
              queueNode => queueNode.started !== undefined && queueNode.finished === undefined
            );

            startedNotFinished.forEach(startedNotFinishedNode => {
               if (tact - startedNotFinishedNode.started == Number.parseInt(startedNotFinishedNode.weight) - 1) {
                   startedNotFinishedNode.finished = tact;
               }
            });

            // At the very end of tact set isReady = true for nodes that finished in current tact
            const finishedInCurrentTact = updatedQueue.filter(queueNode => queueNode.finished === tact);
            finishedInCurrentTact.forEach(node => {
                node.isComputed = true;
                const processorToSetFree = updatedProcessors.find(updatedProcessor =>
                  updatedProcessor.computing === node.id);

                processorToSetFree.computing = "";
                processorToSetFree.isFree = true;
            });

            console.log(updatedProcessors.map(p => p.isFree));

            // Increment tact and update queue is state
            this.setState({
                tact: this.state.tact + 1,
                queue: updatedQueue,
                processors: updatedProcessors
            });
        } else {
            console.log('processors after computing', processors);
        }

        console.log('updatedQueue', updatedQueue);
    }


    render() {
        return (
          <div className={'planning'}>
              {this.state.processors.map(processor => {
                  return <div>
                      {processor.actionsList.map(action => {
                          return <span>{action}  </span>
                      })}
                  </div>
              })}
          </div>
        )
    }
}