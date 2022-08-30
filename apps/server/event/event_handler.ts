export interface EventHandler<T> {
    name: string,
    executor(context: T): Promise<void>
}