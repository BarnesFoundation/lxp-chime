import React, { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { useDataEvents } from '../../providers/DataEventsProvider';

type IIIFViewerProps = {
  tileSources: string[];
};

/**
 * Setup for IIIFViewer.
 * This will use a ref to drop out of react.
 */
const IIIFViewer: React.FC<IIIFViewerProps> = ({ tileSources }: IIIFViewerProps) => {
  const ref: React.Ref<HTMLDivElement> = useRef(null);
  const { sendEvent, events } = useDataEvents();
  const [osd, setOsd] = useState<OpenSeadragon.Viewer>();

  // Pass ref to useEffect, canvas for IIIF viewer will be dropped underneath the ref.
  useEffect(() => {
    const initOsd = OpenSeadragon({
      element: ref.current !== null ? ref.current : undefined,
      tileSources,
    });

    initOsd.addHandler('canvas-click', function (event: OpenSeadragon.CanvasClickEvent) {
      // The canvas-click event gives us a position in web coordinates.
      const webPoint = event.position;

      // Convert that to viewport coordinates, the lingua franca of OpenSeadragon coordinates.
      const viewportPoint = initOsd.viewport.pointFromPixel(webPoint);

      // Convert from viewport coordinates to image coordinates.
      const imagePoint = initOsd.viewport.viewportToImageCoordinates(viewportPoint);

      // Get viewport bounds
      const bounds = initOsd.viewport.getBounds(true);

      // Show the results.
      console.log(webPoint.toString(), viewportPoint.toString(), imagePoint.toString(), bounds.toString());

      // TODO: share coordinates via chime sdk
      sendEvent(bounds.toString());
    });

    initOsd.addHandler('canvas-drag-end', function (event) {
      // The canvas-drag-end event gives us a position in web coordinates.
      const webPoint = event.position;

      // Convert that to viewport coordinates, the lingua franca of OpenSeadragon coordinates.
      const viewportPoint = initOsd.viewport.pointFromPixel(webPoint);

      // Convert from viewport coordinates to image coordinates.
      const imagePoint = initOsd.viewport.viewportToImageCoordinates(viewportPoint);

      // Get viewport bounds
      const bounds = initOsd.viewport.getBounds(true);

      // Show the results.
      console.log(webPoint.toString(), viewportPoint.toString(), imagePoint.toString(), bounds.toString());

      // TODO: share coordinates via chime sdk
      sendEvent(bounds.toString());
    });

    initOsd.addHandler('canvas-scroll', function (event) {
      // The canvas-scroll event gives us a position in web coordinates.
      const webPoint = event.position;

      // Convert that to viewport coordinates, the lingua franca of OpenSeadragon coordinates.
      const viewportPoint = initOsd.viewport.pointFromPixel(webPoint);

      // Convert from viewport coordinates to image coordinates.
      const imagePoint = initOsd.viewport.viewportToImageCoordinates(viewportPoint);

      // Get viewport bounds
      const bounds = initOsd.viewport.getBounds(true);

      // Show the results.
      console.log(webPoint.toString(), viewportPoint.toString(), imagePoint.toString(), bounds.toString());

      // TODO: share coordinates via chime sdk
      sendEvent(bounds.toString());
    });

    initOsd.addHandler('home', function (event: OpenSeadragon.HomeEvent) {
      // Get viewport bounds
      const bounds = initOsd.viewport.getBounds(true);

      console.log(bounds.toString());
      // TODO: share coordinates via chime sdk
      sendEvent(bounds.toString());
    });

    setOsd(initOsd);

    return () => {
      initOsd.destroy();
    };
  }, [tileSources]);

  // Console.log canvas events
  useEffect(() => {
    if (events.length < 1 && !osd) {
      return;
    } else {
      const eventObj = events[events.length - 1];
      const event = eventObj?.event;
      const coords = event?.substring(1, event.length - 1).split(', ');
      console.log(events.length, '\n********************', eventObj, '\n', event);

      if (coords) {
        const x = parseFloat(coords[0]);
        const y = parseFloat(coords[1]);
        const width = parseFloat(coords[2]);
        const height = parseFloat(coords[3]);
        const rect = new OpenSeadragon.Rect(x, y, width, height);
        const bounds = osd?.viewport.getBounds(true);
        console.log('bounds', bounds);
        console.log('coords', coords, rect);

        if (bounds && !rect.equals(bounds) && !eventObj.isSelf) {
          console.log('updating viewport bounds...');
          osd?.viewport.fitBounds(rect);
        }
      }
    }
  }, [events, osd]);

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
