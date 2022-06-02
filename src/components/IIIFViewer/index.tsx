import React, { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { useDataEvents } from '../../providers/DataEventsProvider';

type IIIFViewerProps = {
  tileSources: string[];
  leader: boolean;
  setLeader: (leader: boolean) => void;
};

enum EventTypes {
  HOME = 'home',
  CANVAS_CLICK = 'canvas-click',
  CANVAS_DRAG = 'canvas-drag',
  CANVAS_SCROLL = 'canvas-scroll',
  LEADER_CHANGE = 'leader-change',
  PAN = 'pan',
  ZOOM = 'zoom',
}

type EventPayload = {
  type: EventTypes;
  zoom?: number;
  center?: OpenSeadragon.Point;
  leader: boolean;
};

/**
 * Setup for IIIFViewer.
 * This will use a ref to drop out of react.
 */
const IIIFViewer: React.FC<IIIFViewerProps> = ({ tileSources, leader, setLeader }: IIIFViewerProps) => {
  const ref: React.Ref<HTMLDivElement> = useRef(null);
  const { sendEvent, events } = useDataEvents();
  const [osd, setOsd] = useState<OpenSeadragon.Viewer>();

  // OpenSeadragon Viewer event handler functions
  const handleHome = (event: OpenSeadragon.HomeEvent) => {
    const payload: EventPayload = {
      type: EventTypes.HOME,
      leader: leader,
    };
    const message = JSON.stringify(payload);
    console.log('payload:', payload, message);
    console.log('leader', leader);

    sendEvent(message);
  };

  const handlePan = (event: OpenSeadragon.PanEvent) => {
    const viewportCenter = event.eventSource.viewport.getCenter();

    const payload: EventPayload = {
      type: EventTypes.PAN,
      center: viewportCenter,
      leader: leader,
    };
    const message = JSON.stringify(payload);
    console.log('payload:', payload, message);

    sendEvent(message);
  };

  const handleZoom = (event: OpenSeadragon.ZoomEvent) => {
    const viewportZoom = event.eventSource.viewport.getZoom();

    const payload: EventPayload = {
      type: EventTypes.ZOOM,
      zoom: viewportZoom,
      leader: leader};
    const message = JSON.stringify(payload);
    console.log('payload:', payload, message);

    sendEvent(message);
  };

  // Helper to add all handlers to a viewer
  const addHandlers = (viewer: OpenSeadragon.Viewer) => {
    viewer.addHandler(EventTypes.HOME, handleHome);
    viewer.addHandler(EventTypes.PAN, handlePan);
    viewer.addHandler(EventTypes.ZOOM, handleZoom);
  };

  // Helper to remove all handlers to a viewer
  const removeHandlers = (viewer: OpenSeadragon.Viewer) => {
    viewer.removeHandler(EventTypes.HOME, handleHome);
    viewer.removeHandler(EventTypes.PAN, handlePan);
    viewer.removeHandler(EventTypes.ZOOM, handleZoom);};

  // Pass ref to useEffect, canvas for IIIF viewer will be dropped underneath the ref.
  useEffect(() => {
    const initOsd = OpenSeadragon({
      element: ref.current !== null ? ref.current : undefined,
      tileSources,
      visibilityRatio: 1.0,
      constrainDuringPan: true,
    });

    addHandlers(initOsd);
    setOsd(initOsd);

    return () => {
      initOsd.destroy();
    };
  }, [tileSources, setOsd]);

  useEffect(() => {
    const viewport = osd?.viewport;

    if (viewport) {
      const viewportZoom = viewport.getZoom(true);
      const imageZoom = viewport.viewportToImageZoom(viewportZoom);
      console.log('initial zoom', viewportZoom, imageZoom);

      const viewportCenter = viewport.getCenter(true);
      const imageCenter = viewport.viewportToImageCoordinates(viewportCenter);
      console.log('initial center', viewportCenter, imageCenter);

      if (!leader && events.length) {
        const eventObj = events[events.length - 1];
        console.log(eventObj);

        if (!eventObj.isSelf && eventObj.event) {
          const event: EventPayload = JSON.parse(eventObj.event);

          if (event.type === EventTypes.HOME && event.leader) {
            viewport.fitBoundsWithConstraints(osd?.viewport.getHomeBounds() as OpenSeadragon.Rect);
          } 
          
          if (event.type === EventTypes.PAN && event.leader) {
            const center = event.center as OpenSeadragon.Point;
            viewport.panTo(center, true);
          } 
          
          if (event.type === EventTypes.ZOOM && event.leader) {
            const zoom = event.zoom as number;
            viewport.zoomTo(zoom, event.center, true);
          }
        }
      } else if (leader && events.length) {
        const eventObj = events[events.length - 1];
        const event: EventPayload = JSON.parse(eventObj.event);
  
        if (event.type === EventTypes.LEADER_CHANGE && !eventObj.isSelf) {
          // Handle when another participant elects to become the leader
          setLeader(false);
          // only emit events when leader
          removeHandlers(osd as OpenSeadragon.Viewer);
        }
      }
    }
  }, [osd, events, leader]);

  // Handle when user becomes leader
  useEffect(() => {
    if (leader) {
      addHandlers(osd as OpenSeadragon.Viewer);
    }
  }, [leader]);

  return (
    <div
      className="app__iiif-viewer iiif-viewer"
      ref={ref}
      style={{ width: '100%', height: '100%' }}
    >
    </div>
  );
};

export default IIIFViewer;
