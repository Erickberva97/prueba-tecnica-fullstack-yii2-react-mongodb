<?php

namespace app\modules\soporte\controllers;

use Yii;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;
use yii\filters\auth\HttpBearerAuth;
use yii\rest\Controller;
use yii\web\BadRequestHttpException;
use yii\web\NotFoundHttpException;
use yii\web\ServerErrorHttpException;
use app\modules\soporte\models\SolicitudSoporte;

class SolicitudController extends Controller
{
    public $enableCsrfValidation = false;

    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
            'only' => ['create', 'estado'],
        ];

        return $behaviors;
    }

    /**
     * Métodos HTTP permitidos por acción.
     */
    protected function verbs()
    {
        return [
            'index' => ['GET'],
            'view' => ['GET'],
            'create' => ['POST'],
            'estado' => ['PUT'],
            'resumen' => ['GET'],
        ];
    }

    /**
     * GET /api/solicitudes
     *
     * Filtros opcionales:
     * ?estado=PENDIENTE
     * ?prioridad=ALTA
     */
    public function actionIndex()
    {
        $estado = Yii::$app->request->get('estado');
        $prioridad = Yii::$app->request->get('prioridad');

        if (
            $estado !== null &&
            !in_array($estado, SolicitudSoporte::estados(), true)
        ) {
            throw new BadRequestHttpException(
                'El estado indicado no es válido.'
            );
        }

        if (
            $prioridad !== null &&
            !in_array($prioridad, SolicitudSoporte::prioridades(), true)
        ) {
            throw new BadRequestHttpException(
                'La prioridad indicada no es válida.'
            );
        }

        $query = SolicitudSoporte::find();

        if ($estado !== null) {
            $query->andWhere([
                'estado' => $estado,
            ]);
        }

        if ($prioridad !== null) {
            $query->andWhere([
                'prioridad' => $prioridad,
            ]);
        }

        $solicitudes = $query->all();

        return [
            'success' => true,
            'data' => array_map(
                fn ($solicitud) => $this->formatearSolicitud($solicitud),
                $solicitudes
            ),
        ];
    }

    /**
     * GET /api/solicitudes/{id}
     */
    public function actionView($id)
    {
        $solicitud = $this->buscarSolicitud($id);

        return [
            'success' => true,
            'data' => $this->formatearSolicitud($solicitud),
        ];
    }

    /**
     * POST /api/solicitudes
     */
    public function actionCreate()
    {
        $body = Yii::$app->request->bodyParams;

        $model = new SolicitudSoporte();

        // Solo se toman del cliente los campos permitidos.
        $model->titulo = $body['titulo'] ?? null;
        $model->descripcion = $body['descripcion'] ?? null;
        $model->prioridad = $body['prioridad'] ?? null;

        // Campos controlados exclusivamente por el backend.
        $model->estado = SolicitudSoporte::ESTADO_PENDIENTE;
        $model->usuario_id = (int) Yii::$app->user->id;

        $ahora = new UTCDateTime();

        $model->fecha_creacion = $ahora;
        $model->fecha_actualizacion = $ahora;

        if (!$model->validate()) {
            Yii::$app->response->statusCode = 400;

            return [
                'success' => false,
                'message' => 'Los datos enviados no son válidos.',
                'errors' => $model->errors,
            ];
        }

        if (!$model->save(false)) {
            throw new ServerErrorHttpException(
                'No fue posible registrar la solicitud.'
            );
        }

        Yii::$app->response->statusCode = 201;

        return [
            'success' => true,
            'message' => 'Solicitud registrada correctamente.',
            'data' => $this->formatearSolicitud($model),
        ];
    }

    /**
     * PUT /api/solicitudes/{id}/estado
     */
    public function actionEstado($id)
    {
        $solicitud = $this->buscarSolicitud($id);

        $body = Yii::$app->request->bodyParams;
        $nuevoEstado = $body['estado'] ?? null;

        if (!in_array($nuevoEstado, SolicitudSoporte::estados(), true)) {
            throw new BadRequestHttpException(
                'El estado indicado no es válido.'
            );
        }

        $transiciones = [
            SolicitudSoporte::ESTADO_PENDIENTE =>
                SolicitudSoporte::ESTADO_EN_PROCESO,

            SolicitudSoporte::ESTADO_EN_PROCESO =>
                SolicitudSoporte::ESTADO_FINALIZADA,
        ];

        $estadoPermitido = $transiciones[$solicitud->estado] ?? null;

        if (
            $estadoPermitido === null ||
            $nuevoEstado !== $estadoPermitido
        ) {
            throw new BadRequestHttpException(
                'La transición de estado solicitada no está permitida.'
            );
        }

        $solicitud->estado = $nuevoEstado;
        $solicitud->fecha_actualizacion = new UTCDateTime();

        if (!$solicitud->save(false)) {
            throw new ServerErrorHttpException(
                'No fue posible actualizar el estado de la solicitud.'
            );
        }

        return [
            'success' => true,
            'message' => 'Estado actualizado correctamente.',
            'data' => $this->formatearSolicitud($solicitud),
        ];
    }

    /**
     * GET /api/solicitudes/resumen
     */
    public function actionResumen()
    {
        $collection = Yii::$app->mongodb
            ->getCollection(SolicitudSoporte::collectionName());

        $resultado = $collection->aggregate([
            [
                '$group' => [
                    '_id' => null,

                    'total' => [
                        '$sum' => 1,
                    ],

                    'pendientes' => [
                        '$sum' => [
                            '$cond' => [
                                [
                                    '$eq' => [
                                        '$estado',
                                        SolicitudSoporte::ESTADO_PENDIENTE,
                                    ],
                                ],
                                1,
                                0,
                            ],
                        ],
                    ],

                    'en_proceso' => [
                        '$sum' => [
                            '$cond' => [
                                [
                                    '$eq' => [
                                        '$estado',
                                        SolicitudSoporte::ESTADO_EN_PROCESO,
                                    ],
                                ],
                                1,
                                0,
                            ],
                        ],
                    ],

                    'finalizadas' => [
                        '$sum' => [
                            '$cond' => [
                                [
                                    '$eq' => [
                                        '$estado',
                                        SolicitudSoporte::ESTADO_FINALIZADA,
                                    ],
                                ],
                                1,
                                0,
                            ],
                        ],
                    ],
                ],
            ],
        ]);

        $resumen = $resultado[0] ?? [
            'total' => 0,
            'pendientes' => 0,
            'en_proceso' => 0,
            'finalizadas' => 0,
        ];

        unset($resumen['_id']);

        return [
            'success' => true,
            'data' => $resumen,
        ];
    }

    /**
     * Valida el ObjectId y obtiene la solicitud.
     */
    private function buscarSolicitud(string $id): SolicitudSoporte
    {
        if (!preg_match('/^[0-9a-fA-F]{24}$/', $id)) {
            throw new BadRequestHttpException(
                'El identificador de la solicitud no es válido.'
            );
        }

        $solicitud = SolicitudSoporte::findOne([
            '_id' => new ObjectId($id),
        ]);

        if ($solicitud === null) {
            throw new NotFoundHttpException(
                'La solicitud no fue encontrada.'
            );
        }

        return $solicitud;
    }

    /**
     * Convierte los tipos BSON a valores apropiados para JSON.
     */
    private function formatearSolicitud(
        SolicitudSoporte $solicitud
    ): array {
        return [
            '_id' => (string) $solicitud->_id,
            'titulo' => $solicitud->titulo,
            'descripcion' => $solicitud->descripcion,
            'prioridad' => $solicitud->prioridad,
            'estado' => $solicitud->estado,
            'usuario_id' => $solicitud->usuario_id,
            'fecha_creacion' => $this->formatearFecha(
                $solicitud->fecha_creacion
            ),
            'fecha_actualizacion' => $this->formatearFecha(
                $solicitud->fecha_actualizacion
            ),
        ];
    }

    private function formatearFecha($fecha): ?string
    {
        if (!$fecha instanceof UTCDateTime) {
            return null;
        }

        return $fecha
            ->toDateTime()
            ->setTimezone(new \DateTimeZone('UTC'))
            ->format('Y-m-d\TH:i:s\Z');
    }
}