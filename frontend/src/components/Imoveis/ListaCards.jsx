import React from 'react';
import CardImovel from './CardImovel';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styles from '../../styles/ListaCards.module.css';

export default function ListaCards({ imoveisFiltrados, handleDragEnd, onExcluir, onAtualizar }) {
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="lista-imoveis">
        {(provided) => (
          <div
            className={styles.listaCards}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {imoveisFiltrados.map((imovel, index) => (
              <Draggable key={imovel._id} draggableId={imovel._id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <CardImovel
                      imovel={imovel}
                      onAtualizar={onAtualizar}
                      onExcluir={onExcluir}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
