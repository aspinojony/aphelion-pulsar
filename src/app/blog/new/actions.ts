'use server';

export async function testAction(prevState: any, formData: FormData) {
    console.log('testAction called');
    return { message: 'Test Action Success' };
}
