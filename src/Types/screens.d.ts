declare global {
  interface DrawProps {
    readonly gameId?: string | null;
    readonly drawTypeId?: string | null;
  }

  interface StubProps {
    readonly title: string;
    readonly subtitle?: string;
  }
}

export {};
