import produce from "./produce";

describe("produce", () => {
  it("Returns same object if not modified", () => {
    const obj = {
      a: 1,
      b: "some str",
      c: {
        nestedProp: 1
      }
    };

    const newState = produce(obj, (draft) => {});

    expect(newState).toStrictEqual(obj);
  });

  it("Returns same object if modified simple prop equal to original", () => {
    const obj = {
      a: 1,
      b: "some str",
      c: {
        nestedProp: 1
      }
    };

    const newState = produce(obj, (draft) => {
      draft.a = 1;
    });

    expect(newState).toStrictEqual(obj);
  });

  it("Returns same object if modified nested simple prop equal to original", () => {
    const obj = {
      a: 1,
      b: "some str",
      c: {
        nestedProp: 1
      }
    };

    const newState = produce(obj, (draft) => {
      draft.c.nestedProp = 1;
    });

    expect(newState).toEqual(obj);
  });

  it("Returns new object if state modified", () => {
    const obj = {
      a: 1,
      b: "some str",
      c: {
        nestedProp: 1
      }
    };

    const newState = produce(obj, (draft) => {
      draft.a = 2;
    });

    expect(newState).not.toStrictEqual(obj);
  });

  it("Returns new object if modified nested simple prop changes", () => {
    const obj = {
      a: 1,
      b: "some str",
      c: {
        nestedProp: 1
      }
    };

    const newState = produce(obj, (draft) => {
      draft.c.nestedProp = 2;
    });

    expect(newState).not.toStrictEqual(obj);
    expect(newState.c).not.toStrictEqual(obj.c);
  });

  it("Returns new object if property deleted", () => {
    const obj = {
      a: 1,
      b: "some str"
    };

    const expectedNewState = {
      b: "some str"
    };

    const newState = produce(obj, (draft) => {
      //@ts-ignore
      delete draft.a;
    });

    expect(newState).not.toStrictEqual(obj);
    expect(newState).not.toEqual(obj);
    expect(newState).toEqual(expectedNewState);
  });

  it("Throws error if recipe modifies draft and returns new state", () => {
    const obj = {
      a: 1,
      b: "some str"
    };

    const newStateFactory = () =>
      produce(obj, (draft) => {
        draft.a = 2;

        return { a: 32, b: "some other str" };
      });

    expect(newStateFactory).toThrow(Error);
  });

  it("Returns new value inside draft after mutation", () => {
    const obj = {
      a: 1,
      b: "some str"
    };

    let valAfterMutation;
    const newState = produce(obj, (draft) => {
      draft.a = 2;
      valAfterMutation = draft.a;
    });

    expect(valAfterMutation).toBe(newState.a);
  });
});
