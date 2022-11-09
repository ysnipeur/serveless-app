import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
//import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
//import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay=require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const docClient: DocumentClient = createDynamoDBClient()
const todosTable = process.env.TODOS_TABLE
const index = process.env.TODOS_CREATED_AT_INDEX
//const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export async function createTodo (todoItem: TodoItem): Promise<TodoItem> {
  await docClient
     .put({
       TableName: todosTable,
       Item: todoItem
     })
     .promise()

   return todoItem
}

//recuperer des information par utilisateur
export async function getAllTodosByUserId(userId :string): Promise<TodoItem[]>{
  const result = await docClient.query({
      TableName : todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
      }
  }).promise()
  return result.Items as TodoItem[]
  }


//cette fonction intervient dans generateupload url
export async function getTodoById(todoId :string): Promise<TodoItem>{
  const result = await docClient.query({
      TableName : todosTable,
      IndexName : index,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
          ':todoId': todoId
      }
  }).promise()
  const items=result.Items;
    if(items.length!==0){
      return  result.Items[0] as TodoItem;
    }else{
      return null;
    }
  }

//cette fonction intervient également dans generayeuploadUrl pour mettre à jour un Objet
export async function UpdateTodo(todo :TodoItem ): Promise<TodoItem>{
  const result = await docClient.update({
      TableName : todosTable,
      Key :{
        userId: todo.userId,
        todoId: todo.todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
          ':attachmentUrl': todo.attachmentUrl
      }
  }).promise()
  
  return result.Attributes as TodoItem;
  }

  export async function deleteTodo(todoId: string, userId: string): Promise<void> {
    await docClient.delete({
         TableName : todosTable,
         Key :{
           userId: userId,
           todoId: todoId
         },
     
     }).promise()
     

     }

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}