#include "constat.h"
#include "ui_constat.h"

constat::constat(QWidget *parent) :
    QDialog(parent),
    ui(new Ui::constat)
{
    ui->setupUi(this);
}

constat::~constat()
{
    delete ui;
}
