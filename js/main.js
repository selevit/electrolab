var main = (function () {
    'use strict';

    // Получить условия задачи из таблицы
    this.get_init_data = function()
    {
        var inputs = document.querySelectorAll('.input-number'),
            length = inputs.length,
            data = [];

        for (var i = 0; i < length; i++) {
            var value = Number(inputs[i].value);
            data.push(value);
        }
        return data;
    };

    // Преобразовать строку в человекочитаемый объект
    this.convert_row_to_object = function (row)
    {
        return {
            f: row[0], // индуктивность (Гн)
            I: row[1], // сила тока (мА)
            U: row[2], // напряжение (В)
            Ur: row[3], // U(r) (В)
            Uk: row[4], // U(k) (В)
            Uc: row[5] // U(c) (В)
        };
    };

    // Преобразовать данные из таблицы в человекочитаемый объект
    this.normalize_init_data = function (data)
    {

        var row_length = 6, row = [], result = [],
            length = data.length;
        for (var i = 0; i < length; i++) {
            row.push(data[i]);
            if ((i + 1) % row_length === 0) {
                // переход на новую строку
                result.push(this.convert_row_to_object(row));
                row = [];
            }
        }
        return result;
    };

    // Конвертировать данные строки в целые единицы измерения
    // микрофарады - в фарада, миллиамперы - в амперы и т. д.
    this.convert_row_to_integer_unit = function (row)
    {
        row.I = row.I / 1000.0;
        return row;
    };

    // Получить номинальные значения из формы
    this.get_max_values = function ()
    {
        var max = {
            c: Number(document.getElementById('C-max').value),
            L: Number(document.getElementById('L-max').value),
            R: Number(document.getElementById('R-max').value),
            Rk: Number(document.getElementById('Rk-max').value)
        };
        return max;
    };

    // Посчитать строку
    this.calc_row = function (row, max_values)
    {
        this.data = this.convert_row_to_integer_unit(row);

        this.c = max_values.c;
        this.L = max_values.L;
        this.R = max_values.R;
        this.Rk = max_values.Rk;

        this.get_R = function ()
        {
            return this.data.Ur / this.data.I;
        };

        this.get_Xc = function ()
        {
            return 1.0 / this.get_Xl();
        };

        this.get_Xl = function ()
        {
            return 2 * Math.PI * this.data.f * this.c;
        };

        this.get_Z = function ()
        {
            var expr1 = Math.pow(this.R - this.Rk, 2),
                expr2 = Math.pow(this.get_Xc() - this.get_Xl(), 2);
            return Math.sqrt(expr1 + expr2);
        };

        this.get_cos_fi = function ()
        {
            return this.c + this.Rk / this.get_Z();
        };

        this.get_S = function ()
        {
            return this.data.Ur * this.data.I;
        };

        this.get_P = function ()
        {
            return this.get_S() * this.get_cos_fi();
        };

        this.get_Q = function ()
        {
            var cos_fi = this.get_cos_fi(),
                fi = Math.acos(cos_fi);
            return Math.sin(fi);
        };

        var result = {
            R: this.get_R(),
            Xc: this.get_Xc(),
            Xl: this.get_Xl(),
            Z: this.get_Z(),
            cos_fi: this.get_cos_fi(),
            P: this.get_P(),
            Q: this.get_Q(),
            S: this.get_S()
        };

        return result;
    };

    // Получить полное решение
    this.get_full_solution = function (normalized_data)
    {
        var length = normalized_data.length, result = [],
            max_values = this.get_max_values();
        for (var i = 0; i < length; i++) {
            var row_solution = this.calc_row(normalized_data[i], max_values);
            result.push(row_solution);
        }
        return result;
    };

    // Разделить ячейки с решением на столбцы
    this.separate_solution_cells_by_rows = function (nodelist)
    {
        // Количество ячеек в строке решения
        var row_length = 8, result = [], row = [];
        for (var i = 0; i < nodelist.length; i++) {
            row.push(nodelist[i]);
            if ((i + 1) % row_length === 0) {
                // переход на новую строку
                result.push(row);
                row = [];
            }
        }
        return result;
    };

    this.render_solution = function (full_solution)
    {
        // ячейки с решениями
        var solution_cells = document.querySelectorAll('.solution');
        var solution_matr = this.separate_solution_cells_by_rows(solution_cells);
        for (var i = 0; i < solution_matr.length; i++) {
            // Округляем отображаемые значение до 3-х знаков после запятой
            solution_matr[i][0].innerHTML = full_solution[i].R.toFixed(3);
            solution_matr[i][1].innerHTML = full_solution[i].Xc.toFixed(3);
            solution_matr[i][2].innerHTML = full_solution[i].Xl.toFixed(3);
            solution_matr[i][3].innerHTML = full_solution[i].Z.toFixed(3);
            solution_matr[i][4].innerHTML = full_solution[i].cos_fi.toFixed(3);
            solution_matr[i][5].innerHTML = full_solution[i].P.toFixed(3);
            solution_matr[i][6].innerHTML = full_solution[i].Q.toFixed(3);
            solution_matr[i][7].innerHTML = full_solution[i].S.toFixed(3);

            // Более точные значения подставляем в title
            solution_matr[i][0].title = full_solution[i].R.toFixed(10);
            solution_matr[i][1].title = full_solution[i].Xc.toFixed(10);
            solution_matr[i][2].title = full_solution[i].Xl.toFixed(10);
            solution_matr[i][3].title = full_solution[i].Z.toFixed(10);
            solution_matr[i][4].title = full_solution[i].cos_fi.toFixed(10);
            solution_matr[i][5].title = full_solution[i].P.toFixed(10);
            solution_matr[i][6].title = full_solution[i].Q.toFixed(10);
            solution_matr[i][7].title = full_solution[i].S.toFixed(10);
        }
    };

    var self = this;

    window.onload = function ()
    {
        function update_solution_by_event()
        {
            var data = self.get_init_data(),
                normalized = self.normalize_init_data(data),
                full_solution = self.get_full_solution(normalized);
            self.render_solution(full_solution);
        }

        var inputs = document.querySelectorAll('.input-number'),
            inputs2 = document.querySelectorAll('.input-number2'),
            button = document.getElementById('calculate'),
            i;
        for (i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener('change', update_solution_by_event);
        }
        for (i = 0; i < inputs2.length; i++) {
            inputs2[i].addEventListener('change', update_solution_by_event);
        }
        button.addEventListener('click', update_solution_by_event);
    };

    return this;
}).call({});
