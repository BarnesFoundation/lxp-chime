import React, { useEffect, useRef } from 'react';
import OpenSeadragon from 'openseadragon';
import { useDataMessages } from '../../providers/DataMessagesProvider';

type IIIFViewerProps = {
  tileSources: string[];
};

/**
 * Setup for IIIFViewer.
 * This will use a ref to drop out of react.
 */
const IIIFViewer: React.FC<IIIFViewerProps> = ({ tileSources }: IIIFViewerProps) => {
  const ref: React.Ref<HTMLDivElement> = useRef(null);
  const { sendMessage } = useDataMessages();

  // Pass ref to useEffect, canvas for IIIF viewer will be dropped underneath the ref.
  useEffect(() => {
    const osd = OpenSeadragon({
      element: ref.current !== null ? ref.current : undefined,
      tileSources,
    });

    osd.addHandler('canvas-click', function (event) {
      // The canvas-click event gives us a position in web coordinates.
      const webPoint = event.position;

      // Convert that to viewport coordinates, the lingua franca of OpenSeadragon coordinates.
      const viewportPoint = osd.viewport.pointFromPixel(webPoint);

      // Convert from viewport coordinates to image coordinates.
      const imagePoint = osd.viewport.viewportToImageCoordinates(viewportPoint);

      // Show the results.
      console.log(webPoint.toString(), viewportPoint.toString(), imagePoint.toString());

      // TODO: share coordinates via chime sdk
      sendMessage(webPoint.toString() + viewportPoint.toString() + imagePoint.toString());
    });

    osd.addHandler('canvas-drag-end', function (event) {
      // The canvas-drag-end event gives us a position in web coordinates.
      const webPoint = event.position;

      // Convert that to viewport coordinates, the lingua franca of OpenSeadragon coordinates.
      const viewportPoint = osd.viewport.pointFromPixel(webPoint);

      // Convert from viewport coordinates to image coordinates.
      const imagePoint = osd.viewport.viewportToImageCoordinates(viewportPoint);

      // Show the results.
      console.log(webPoint.toString(), viewportPoint.toString(), imagePoint.toString());

      // TODO: share coordinates via chime sdk
      sendMessage(webPoint.toString() + viewportPoint.toString() + imagePoint.toString());
    });

    osd.addHandler('canvas-scroll', function (event) {
      // The canvas-scroll event gives us a position in web coordinates.
      const webPoint = event.position;

      // Convert that to viewport coordinates, the lingua franca of OpenSeadragon coordinates.
      const viewportPoint = osd.viewport.pointFromPixel(webPoint);

      // Convert from viewport coordinates to image coordinates.
      const imagePoint = osd.viewport.viewportToImageCoordinates(viewportPoint);

      // Show the results.
      console.log(webPoint.toString(), viewportPoint.toString(), imagePoint.toString());

      // TODO: share coordinates via chime sdk
      sendMessage(webPoint.toString() + viewportPoint.toString() + imagePoint.toString());
    });

    osd.addHandler('home', function (event) {
      // TODO: share coordinates via chime sdk
      sendMessage('home');
    });

    return () => {
      osd.destroy();
    };
  }, [tileSources]);

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
