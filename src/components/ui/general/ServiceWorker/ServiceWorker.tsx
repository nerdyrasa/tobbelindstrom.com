import React, { useCallback, useState, useMemo, useEffect } from 'react';
import classNames from 'classnames';

import { Portal } from 'components/tools';
import { Container } from 'components/ui/general';
import { useMutationObserver } from 'hooks';
import { isSSR, getElement } from 'utils';
import styles from './ServiceWorker.module.scss';

const ServiceWorker = () => {
  const serviceWorkerSelector = useMemo(() => '#service-worker', []);
  const [shouldRender, setShouldRender] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (shouldRender) setTimeout(() => setActive(shouldRender), 0);
  }, [shouldRender]);

  const handleMutations = useCallback((mutations) => {
    mutations.forEach(
      ({
        type,
        target
      }: {
        type: MutationRecordType;
        target: Element | null;
      }) => {
        if (type === 'attributes') {
          setShouldRender(
            getElement(target)?.getAttribute('aria-hidden') !== 'true'
          );
        }
      }
    );
  }, []);

  useMutationObserver({
    target: !isSSR ? document.querySelector(serviceWorkerSelector) : null,
    options: { attributes: true },
    callback: handleMutations
  });

  if (shouldRender) {
    return (
      <Portal selector={serviceWorkerSelector}>
        <div
          className={classNames(styles.root, {
            [styles.active]: active
          })}
        >
          <Container>
            <div className={styles.inner}>
              <div className={styles.content}>
                <div className={styles.background}>
                  <h4 className={styles.title}>New content available</h4>
                  <div className={styles.buttons}>
                    <button
                      type="button"
                      className={styles.reload}
                      onClick={() => window.location.reload()}
                    >
                      Update content
                    </button>
                    <span className={styles.separator} />
                    <button
                      type="button"
                      className={styles.close}
                      onClick={() => setShouldRender(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </Portal>
    );
  }

  return null;
};

export default ServiceWorker;
