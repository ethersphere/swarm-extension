interface Flavored<Name> {
  _type?: Name
}

export type FlavoredType<Type, Name> = Type & Flavored<Name>
