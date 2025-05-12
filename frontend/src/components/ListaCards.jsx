
import React from 'react';
import CardImovel from './CardImovel';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../styles/ListaCards.css'; // Crie um arquivo CSS para este componente

function ListaCards({ imoveisFiltrados, handleDragEnd }) {
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable
        isCombineEnabled={true}
        droppableId="droppable"
        isDropDisabled={false}
        ignoreContainerClipping={true}
      >
        {(provided) => (
          <div className="lista-cards" {...provided.droppableProps} ref={provided.innerRef}>
            {imoveisFiltrados.map((imovel, index) => (
              <Draggable key={imovel._id} draggableId={imovel._id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <CardImovel imovel={imovel} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext >
  );
}

export default ListaCards;