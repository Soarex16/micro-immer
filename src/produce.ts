type Draft<T> = T;

type Recipe<T> = (draft: Draft<T>) => T | void;

function deepProxify<T extends object>(obj: T, handler: ProxyHandler<any>) {
  const props = Object.getOwnPropertyNames(obj);
  props.forEach((propName) => {
    const val = obj[propName];
    if (typeof val === "object") {
      deepProxify(val, handler);
    }
  });

  return new Proxy(obj, handler);
}

//TODO: adapt code to nested objects + refactor (split responsibilities: proxy creation, scope recording, patching)
export default function produce<T extends object>(
  initialState: T,
  recipe: Recipe<T>
): T {
  let stateMutated = false;
  let changes: Partial<T> = {};

  const proxyHandler: ProxyHandler<T> = {
    get(target, prop) {
      return changes[prop] || target[prop];
    },
    set(target, prop, value) {
      if (target[prop] === value) return true;

      stateMutated = true;
      changes[prop] = value;
      return true;
    },
    deleteProperty(target, prop) {
      if (target[prop] === undefined) return true;

      stateMutated = true;
      changes[prop] = undefined;
      return true;
    }
  };

  const { proxy, revoke } = Proxy.revocable(initialState, proxyHandler);
  const returnedNewState = recipe(proxy);
  revoke();

  if (returnedNewState && stateMutated) {
    throw new Error(
      "Recipe can't modify draft and return new state at the same time"
    );
  } else if (returnedNewState) {
    return returnedNewState;
  } else {
    if (!stateMutated) return initialState;

    return { ...initialState, ...changes };
  }
}
