<?php

namespace app\modules\soporte\models;

use yii\mongodb\ActiveRecord;

class SolicitudSoporte extends ActiveRecord
{
    public const PRIORIDAD_BAJA = 'BAJA';
    public const PRIORIDAD_MEDIA = 'MEDIA';
    public const PRIORIDAD_ALTA = 'ALTA';

    public const ESTADO_PENDIENTE = 'PENDIENTE';
    public const ESTADO_EN_PROCESO = 'EN_PROCESO';
    public const ESTADO_FINALIZADA = 'FINALIZADA';

    public static function collectionName()
    {
        return 'solicitud_soporte';
    }

    public function attributes()
    {
        return [
            '_id',
            'titulo',
            'descripcion',
            'prioridad',
            'estado',
            'usuario_id',
            'fecha_creacion',
            'fecha_actualizacion',
        ];
    }

    public function rules()
    {
        return [
            // Limpia espacios al inicio y al final
            [['titulo', 'descripcion', 'prioridad'], 'trim'],

            [
                'titulo',
                'required',
                'message' => 'El título es obligatorio.',
            ],

            [
                'descripcion',
                'required',
                'message' => 'La descripción es obligatoria.',
            ],

            [
                'prioridad',
                'required',
                'message' => 'La prioridad es obligatoria.',
            ],

            [
                'titulo',
                'string',
                'message' => 'El título debe ser una cadena de texto.',
            ],

            [
                'descripcion',
                'string',
                'message' => 'La descripción debe ser una cadena de texto.',
            ],

            [
                'prioridad',
                'in',
                'range' => self::prioridades(),
                'message' => 'La prioridad debe ser BAJA, MEDIA o ALTA.',
            ],

            [
                'estado',
                'in',
                'range' => self::estados(),
                'message' => 'El estado debe ser PENDIENTE, EN_PROCESO o FINALIZADA.',
            ],

            [
                'usuario_id',
                'integer',
                'message' => 'El identificador del usuario debe ser un número entero.',
            ],

            [
                ['fecha_creacion', 'fecha_actualizacion'],
                'safe',
            ],
        ];
    }

    public static function prioridades(): array
    {
        return [
            self::PRIORIDAD_BAJA,
            self::PRIORIDAD_MEDIA,
            self::PRIORIDAD_ALTA,
        ];
    }

    public static function estados(): array
    {
        return [
            self::ESTADO_PENDIENTE,
            self::ESTADO_EN_PROCESO,
            self::ESTADO_FINALIZADA,
        ];
    }
}