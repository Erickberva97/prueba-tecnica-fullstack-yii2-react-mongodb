<?php

namespace app\commands;

use Yii;
use yii\console\Controller;
use app\modules\soporte\models\SolicitudSoporte;

class MongoController extends Controller
{
    //comprobación de la conexión a la base de datos MongoDB 
    public function actionPing()
    {
        $cursor = Yii::$app->mongodb
            ->getDatabase()
            ->createCommand(['ping' => 1])
            ->execute();

        print_r($cursor->toArray());
    }
    //comprobación de la carga del modelo SolicitudSoporte
    public function actionModelo()
    {
        $model = new SolicitudSoporte();

        echo 'Modelo cargado: ' . get_class($model) . PHP_EOL;
        echo 'Coleccion: ' . SolicitudSoporte::collectionName() . PHP_EOL;
    }
    //inicialización de la colección solicitud_soporte en la base de datos MongoDB 
    public function actionInit()
    {
        $database = Yii::$app->mongodb->getDatabase();

        $validator = [
            '$jsonSchema' => [
                'bsonType' => 'object',
                'required' => [
                    'titulo',
                    'descripcion',
                    'prioridad',
                    'estado',
                    'usuario_id',
                    'fecha_creacion',
                    'fecha_actualizacion',
                ],
                'properties' => [
                    '_id' => [
                        'bsonType' => 'objectId',
                    ],
                    'titulo' => [
                        'bsonType' => 'string',
                    ],
                    'descripcion' => [
                        'bsonType' => 'string',
                    ],
                    'prioridad' => [
                        'enum' => [
                            SolicitudSoporte::PRIORIDAD_BAJA,
                            SolicitudSoporte::PRIORIDAD_MEDIA,
                            SolicitudSoporte::PRIORIDAD_ALTA,
                        ],
                    ],
                    'estado' => [
                        'enum' => [
                            SolicitudSoporte::ESTADO_PENDIENTE,
                            SolicitudSoporte::ESTADO_EN_PROCESO,
                            SolicitudSoporte::ESTADO_FINALIZADA,
                        ],
                    ],
                    'usuario_id' => [
                        'bsonType' => ['int', 'long'],
                    ],
                    'fecha_creacion' => [
                        'bsonType' => 'date',
                    ],
                    'fecha_actualizacion' => [
                        'bsonType' => 'date',
                    ],
                ],
            ],
        ];

        $command = $database->createCommand([
            'create' => SolicitudSoporte::collectionName(),
            'validator' => $validator,
            'validationLevel' => 'strict',
            'validationAction' => 'error',
        ]);

        try {
            $command->execute();

            $this->stdout(
                "Coleccion solicitud_soporte creada correctamente." . PHP_EOL
            );
        } catch (\MongoDB\Driver\Exception\CommandException $e) {
            if ($e->getCode() === 48) {
                $this->stdout(
                    "La coleccion solicitud_soporte ya existe." . PHP_EOL
                );

                return;
            }

            throw $e;
        }
    }

    // Creación de índices para optimizar los filtros requeridos por la aplicación
    public function actionIndexes()
    {
        $collection = Yii::$app->mongodb
            ->getCollection(SolicitudSoporte::collectionName());

        $collection->createIndex(
            [
                'estado' => 1,
                'prioridad' => 1,
            ],
            [
                'name' => 'idx_estado_prioridad',
            ]
        );

        $collection->createIndex(
            [
                'prioridad' => 1,
            ],
            [
                'name' => 'idx_prioridad',
            ]
        );

        $this->stdout(
            "Indices creados correctamente." . PHP_EOL
        );
    }
}