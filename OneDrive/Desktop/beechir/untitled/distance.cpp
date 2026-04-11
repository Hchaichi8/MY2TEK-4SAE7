#include "distance.h"
#include "ui_distance.h"

distance::distance(QWidget *parent) :
    QDialog(parent),
    ui(new Ui::distance)
{
    ui->setupUi(this);
}

distance::~distance()
{
    delete ui;
}
