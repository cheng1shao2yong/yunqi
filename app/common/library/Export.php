<?php
declare(strict_types=1);

namespace app\common\library;

use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Csv;

class Export
{
    /* @var Csv $writer */
    private $spreadsheet;
    private $column=[];
    private $data=[];
    private $searchList=[];

    public function __construct()
    {
        $this->spreadsheet=new Spreadsheet();
    }

    public function setColumn($column)
    {
        $this->column=$column;
    }

    public function setData($data,$searchList=[]){
        $this->data=$data;
        $this->searchList=$searchList;
    }

    public function write()
    {
        $worksheet = $this->spreadsheet->getActiveSheet();
        $i=0;
        foreach ($this->column as $column){
            $i++;
            $columnName = Coordinate::stringFromColumnIndex($i);
            $worksheet->setCellValue($columnName.'1', $column);
        }
        foreach ($this->data as $row=>$data){
            $lie=1;
            foreach ($this->column as $key=>$column){
                $value=$this->getLieValue($data,$key);
                if(key_exists($key,$this->searchList)){
                    $value=key_exists($value,$this->searchList[$key])?$this->searchList[$key][$value]:$value;
                }
                $columnName = Coordinate::stringFromColumnIndex($lie);
                $worksheet->setCellValue($columnName.($row+2), $value);
                $lie++;
            }
        }
    }

    private function getLieValue($data,$key)
    {
        if(strpos($key,'.')!==false){
            $key=explode('.',$key);
            if(isset($data[$key[0]]) && isset($data[$key[0]][$key[1]])){
                return $data[$key[0]][$key[1]];
            }
        }else{
            if(isset($data[$key])){
                return $data[$key];
            }
        }
        return '';
    }

    public function save($path,$file)
    {
        $writer = IOFactory::createWriter($this->spreadsheet, 'Xlsx');
        $writer->save($path.$file);
    }

    public function output()
    {
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="'.date('YmdHis',time()).'.xlsx');
        header('Cache-Control: max-age=1');
        $writer = IOFactory::createWriter($this->spreadsheet, 'Xlsx');
        $writer->save('php://output');
        exit;
    }

}